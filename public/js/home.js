import { uploadFile } from "./api/upload.js";
import { createFolder } from "./api/create_folder.js";
import { getFileList, getFileHistory } from "./api/list.js";
import { deleteFile } from "./api/delete.js";
import { downloadFile } from "./api/download.js";
import { restoreFile } from "./api/restore.js";
import { createLink } from "./api/share.js";

import { HOST } from "./constant/constant.js";
// ==========================================================================
// logout button
$(".logout-button").on("click", async function(e) {
  e.preventDefault();
  const logoutReq = await axios.get("/logout");
  // console.log("logoutReq: ", logoutReq);
  window.location.href="/";
});

// check login status
const chkLoginStatus = async() => {
  try {
    await axios.get("/login-status");
    return true;
  } catch(err) {
    window.location.href="/login.html";
    return false;
  }
};

// show file list function
function showList(obj) {
	const fileList = $("#file-list");
	obj.data.forEach((item) => {
		const tickboxValue = item.type === "folder" ? item.name + "/" : item.name;
    // const tickboxClass = item.type === "folder" ? "tickbox-folder" : "tickbox-file";
		const div = $("<div>");
		const tickbox = $("<input>").attr({
			type: "checkbox",
			name: "list-checkbox",
			value: tickboxValue,
      // class: tickboxClass
		});
		const span = $("<span>");

		tickbox.change(function () {
			const selected = $("input[name='list-checkbox']:checked");
			const selectedVal = selected.toArray().map(item => item.value);
      console.log(selectedVal);
      if (selected.length === 1 && !selectedVal[0].endsWith("/")) {
        $("#delete-button").show();
				$("#download-button").show();
        $("#history-button").show();
      } else if (selected.length > 0) {
				$("#delete-button").show();
				$("#download-button").show();
        $("#history-button").hide();
			} else {
				$("#delete-button").hide();
				$("#download-button").hide();
        $("#history-button").hide();
			}
      $("#file-history").hide();
		});

		if (item.type !== "folder") {
			span.text(`${item.name} ${new Date(item.updated_at).toLocaleString()}`);
			span.addClass("file").attr("data-file-id", item.id);
		} else {
			span.text(item.name);
			span.addClass("folder").attr("data-folder-id", item.id);
		}
    const linkbtn = $("<button>");
    linkbtn.text("Get Link").addClass("link-btn");
    div.addClass("file-div");
		div.append(tickbox, span, linkbtn);
		fileList.append(div);
	});
}

// show file list under root folder 
const isLogin = await chkLoginStatus();
if (isLogin) {
  
  // add root path
  $("#whole-path").append(`
    <a href="${HOST}/home.html">
      <h2>
        <span class="path-text">
          Home
        </span>
      </h2>
    </a>
  `);

  const url = new URL(window.location.href);
  const path = url.searchParams.get("path");
  const list = await getFileList((path === null ? "Home" : "Home/" + path));
  showList(list);
  if (path != null) {
    const pathArray = path.split("/").reduce((prev, curr, i) => {
      const folder = (i === 0) ? curr : `${prev[i - 1]}/${curr}`;
      return [...prev, folder];
    }, []);
    // console.log("pathArray: ", pathArray);
    pathArray.forEach((item, i) => {
      $("#whole-path").append(`
        <span class="path-slash"> / </span>
        <a href="${HOST}/home.html?path=${item}">
          <h2>
            <span class="path-text">
              ${item.split("/").pop()}
            </span>
          </h2>
        </a>
      `);
    });
  }
  // TODO: if path in url is not exsited -> should redirect user to home page
}

// click folder --> show lists under that folder
$("#file-list").on("click", ".folder", async function () {
	const dirName = $(this).text();
  const pathTexts = $(".path-text").map(function() {
    return $(this).text().trim();
  }).get().join("/");
  let uri;
  if (pathTexts === "Home") {
    uri = dirName;
  } else {
    uri = `${pathTexts.replace(/^Home\//,"")}/${dirName}`;
  }

  console.log("dirName: ", dirName);
  console.log("pathTexts: ", pathTexts);
  console.log("uri: ", uri);
  history.pushState({}, "", `/home.html?path=${uri}`);

	// clear file list and get file list under new dir
  const newPath = `${pathTexts}/${dirName}`;
	$("#file-list").empty();
	const newList = await getFileList(newPath);
	showList(newList);
  
	// update current path
  $("#whole-path").append(`
    <span class="path-slash"> / </span>
    <a href="${HOST}/home.html?path=${uri}">
      <h2>
        <span class="path-text">
          ${dirName}
        </span>
      </h2>
    </a>
  `);

	$("#file-input").val("");
	$("#folder-input").val("");
});

// click share button
$("#file-list").on("click", ".link-btn", async function () {
  
  // 找到按鈕所在的 file-div 元素
  const fileDiv = $(this).closest(".file-div");
  // 找到 checkbox 的 value 屬性
  const targetName = fileDiv.find("input[type=\"checkbox\"]").val();

  const parentPath = $(".path-text").map(function() {
    return $(this).text().trim();
  }).get().join("/");
  
  const getLink = await createLink(parentPath, targetName);
  console.log("getLink: ", getLink);
  
  if (getLink.share_link) {
		const inputForShareLink = $("<input>");
		$("body").append(inputForShareLink);
		inputForShareLink.val(getLink.share_link);
		inputForShareLink.select();

		const copyToClipboard = (text) => {
			navigator.clipboard
				.writeText(text)
				.then(() => {
					console.log("Text copied to clipboard");
				})
				.catch((err) => {
					console.error("Error copying text to clipboard:", err);
				});
		};

		copyToClipboard(getLink.share_link);
		inputForShareLink.remove();
		prompt("Here's your link: ", getLink.share_link);
	}
});

// ==========================================================================
// socket.io
const socket = io();
socket.on("listupd", (data) => {
	console.log("socket.on listupd: ", data);
  // console.log("In socket.on(\"listupd\")");
	
  const pathTexts = $(".path-text").map(function() {
    return $(this).text().trim();
  }).get().join("/");
  
  let currentPath = "";
	if (pathTexts !== "Home") {
		currentPath = pathTexts.replace(/^Home\//,"");
	}
  // console.log("currentPath: ", currentPath);
  // console.log("pathTexts: ", pathTexts);

	if (currentPath === data.parentPath) {
		$("#file-list").empty();
		showList(data.list);
	}
});

// ==========================================================================
// upload file
$("#form-file").on("submit", async function (e) {
	e.preventDefault();
  const currentPath = $(".path-text").map(function() {
    return $(this).text().trim();
  }).get().join("/");
  console.log(currentPath);
	const fileList = $("#file-input")[0].files;

	for (let file of fileList) {
    const uploadFileRes = await uploadFile(currentPath, file);
    console.log("uploadFileRes: ", uploadFileRes);
	}

	$("#file-input").val("");
});

// upload folder
$("#form-folder").on("submit", async function (e) {
	e.preventDefault();
	// const currentPath = $("#current-path").text();
  const currentPath = $(".path-text").map(function() {
    return $(this).text().trim();
  }).get().join("/");
	const fileList = $("#folder-input")[0].files;

	for (let file of fileList) {
		const uploadFileRes = await uploadFile(currentPath, file);
    console.log("uploadFileRes: ", uploadFileRes);
	}

	$("#folder-input").val("");
});

// create folder
const dialog = $("#create-folder-dialog").dialog({
  autoOpen: false,
  modal: true,
  buttons: {
    "Create": async function() {
      
      const currentPath = $(".path-text").map(function() {
        return $(this).text().trim();
      }).get().join("/");
      const createFolderName = $("#create-folder-name").val();

      const createFolderRes = await createFolder(currentPath, createFolderName);
      console.log("createFolderRes: ", createFolderRes);
      
      // TODO: if (createFolderRes.response.status !== 200)
      // if (createFolderRes.data && createFolderRes.data.msg === "Folder existed") {
      //   alert(`Folder ${createFolderName} has been existed`);
      // }

      $(this).dialog("close");
      $("#create-folder-name").val("");
    },
    "Cancel": function() {
      $(this).dialog("close");
      $("#create-folder-name").val("");
    }
  }
});

$("#create-button").on("click", function() {
  dialog.dialog("open");
});

// ==========================================================================
// delete
$("#delete-button").click(async function () {
  // const currentPath = $("#current-path").text();
  const currentPath = $(".path-text").map(function() {
    return $(this).text().trim();
  }).get().join("/");
  const selected = $("input[name='list-checkbox']:checked");
  
  const deleteFileRes = await deleteFile(currentPath, selected);
  console.log("deleteFileRes: ", deleteFileRes);
	
	selected.prop("checked", false);
	$("#delete-button").hide();
	$("#download-button").hide();
});

// download
$("#download-button").click(async function () {
  // const currentPath = $("#current-path").text();
  const currentPath = $(".path-text").map(function() {
    return $(this).text().trim();
  }).get().join("/");
	const selected = $("input[name='list-checkbox']:checked");
	
  const downloadFileRes = await downloadFile(currentPath, selected);
  // console.log("downloadFileRes: ", downloadFileRes);
  if (downloadFileRes.status === 200) {
    window.open(downloadFileRes.downloadUrl, "_self");
  }

	selected.prop("checked", false);
	$("#delete-button").hide();
	$("#download-button").hide();
});

// showhistory
$("#history-button").click(async function () {
	$("#file-history").empty();
	const currentPath = $(".path-text")
		.map(function () {
			return $(this).text().trim();
		})
		.get()
		.join("/");
	const selected = $("input[name='list-checkbox']:checked");
	const selectedArr = selected.toArray().map((item) => {
		if (currentPath === "Home") {
			return item.value;
		} else {
			return `${currentPath.replace(/^Home\//, "")}/${item.value}`;
		}
	});
  const fileWholePath = selectedArr[0];
	// console.log(fileWholePath);
	const historyRes = await getFileHistory(fileWholePath);
	// change to function
  console.log(historyRes);
	const allRecords = [...historyRes.versions, ...historyRes.deleteRecords];
	allRecords.sort((a, b) => a.operation_time - b.operation_time);
	for (const operation of allRecords) {
		let record = "";
		if (operation.operation === "delete") {
			const time = new Date(operation.operation_time).toLocaleString();
			record = `<div> deleted at ${time} </div>`;
		} else if (operation.operation) {
			const time = new Date(operation.operation_time).toLocaleString();

			const verb =
				operation.operation === "add"
					? operation.operation + "ed"
					: operation.operation + "d";
      let versionDiv = `
        <div class="version" data-version="${operation.ver}"> 
          ${verb} at ${time}, size = ${operation.size} kb
        </div>
      `;
			// record = `
      //   <div class="version" data-version=${operation.ver}> 
      //     ${verb} at ${time}, size = ${operation.size} kb
          
      //   </div>`;
      console.log("operation: ", operation);
      if (operation.is_current === 0) {
        const recoverBtn = `
          <button class="btn-recover" data-version="${operation.ver}">
            Recover
          </button>
        `;
        // how to append recoverBtn inside <div class="version" ... > ?
        versionDiv = $(versionDiv).append(recoverBtn);
      }
      record = versionDiv;
		}
		$("#file-history").append(record);
	}
	$("#file-history").show();

  $("#file-history").on("click", ".btn-recover", async function() {
    const version = $(this).data("version");
    // call recover function with version
    console.log("recover version: ", version);
    console.log("currentPath: ", currentPath);
    console.log("fileWholePath: ", fileWholePath);
    let parentPath = "";
    if (currentPath !== "Home") {
      parentPath = currentPath.replace(/^Home\//, "");
    }
    const askRestore = await restoreFile(version, fileWholePath, parentPath);
    console.log("askRestore: ", askRestore);
  });
});

