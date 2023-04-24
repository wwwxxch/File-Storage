import { getShareFoList, downloadShareFo } from "../../api/view.js";
import { formatTime } from "../../util/util.js";

function showShareFoList(obj) {
	if (obj.data.length === 0) {
		$(".fo-dl-btn").hide();
    $("thead").hide();
    $("tbody").hide();
		return;
	}
  obj.data.forEach(item => {
    const cellName = `
      <td style="width: 29vw">
        <div class="${item.type} ff" data-id="${item.id}">
          ${item.name}
        </div>
      </td>
    `;
    let cellTime;
    if (item.type === "folder") {
      cellTime = `
        <td >
          <div class="d-flex justify-content-between">
            <div>
              --
            </div>
            
            <div>
              <button class="individual-dl-btn btn btn-outline-secondary">
                Download
              </button>
            </div>
          </div>
        </td>
      `;
    } else if (item.type === "file") {
      cellTime = `
        <td > 
          <div class="d-flex justify-content-between">
            <div>${formatTime(item.updated_at)}</div>
            <div>
              <button class="individual-dl-btn btn btn-secondary">
                Download
              </button>
            </div>
          </div>
        </td>
      `;
    }
    const tr = $("<tr>").addClass("ff-row");
    tr.append(cellName, cellTime);
    $("#fo-list-tbody").append(tr);
  });
}

// show list for new request
const windowPathName = window.location.pathname;
const shareToken = windowPathName.split("/")[3];
console.log(shareToken);
const subPath = windowPathName.split("/").slice(4).join("/");
console.log(subPath);

const pathTexts = $(".path-text")
  .map(function () {
    return $(this).text().trim();
  })
  .get()
  .join("/");
console.log("pathTexts: ", pathTexts);

const res = await getShareFoList(shareToken, subPath);
showShareFoList(res);

if (subPath) {
  const pathArray = subPath.split("/").reduce((prev, curr, i) => {
    const folder = i === 0 ? curr : `${prev[i - 1]}/${curr}`;
    return [...prev, folder];
  }, []);
  console.log(pathArray);

  $("#share-path").empty();
  $("#share-path").append(`
    <a href="/view/fo/${shareToken}">
      <h3><span class="path-text">${pathTexts}</span></h3>
    </a>
  `);
  pathArray.forEach((item, i) => {
    $("#share-path").append(`
      <span class="slash"> / </span>
      <a href="/view/fo/${shareToken}/${item}">
        <h3><span class="path-text">${item.split("/").pop()}</span></h3>
      </a>
    `);
  });
}

// show list when clicking
$("#fo-list-table").on("click", ".folder", async function() {
  const dirName = $(this).text().trim();
  const pathTexts = $(".path-text")
  .map(function () {
    return $(this).text().trim();
  })
  .get()
  .join("/");
  const uri = pathTexts.includes("/") ? 
    `${pathTexts.split("/").slice(1).join("/")}/${dirName}` : dirName;
  
  console.log("dirName: ", dirName);
  console.log("pathTexts: ", pathTexts);
  console.log("uri: ", uri);

  history.pushState({}, "", `/view/fo/${shareToken}/${uri}`);
  const subRes = await getShareFoList(shareToken, uri);
  // console.log("subRes: ", subRes);

  $("#fo-list-tbody").empty();
  showShareFoList(subRes);

  $("#share-path").append(`
    <span class="slash"> / </span>
    <a href="/view/fo/${shareToken}/${uri}">
      <h3><span class="path-text">${dirName}</span></h3>
    </a>
  `);
});

// download folder
$(".fo-dl-btn").on("click", async function() {
  const pathTexts = $(".path-text")
  .map(function () {
    return $(this).text().trim();
  })
  .get()
  .join("/");
  console.log(shareToken);
  console.log(pathTexts);
  const downloadFileRes = await downloadShareFo(shareToken, pathTexts + "/");
  if (downloadFileRes.status === 200) {
		window.open(downloadFileRes.downloadUrl, "_self");
	}
});

// download individual file/folder
$(".individual-dl-btn").on("click", async function() {
  const pathTexts = $(".path-text")
  .map(function () {
    return $(this).text().trim();
  })
  .get()
  .join("/");
  console.log(pathTexts);
  const $tr = $(this).closest("tr");
  const target = $tr.find(".ff").text().trim();
  const targetClass = $tr.find(".ff").attr("class").split(" ");
  
  let desired;
  if (targetClass.includes("file")) {
    desired = pathTexts + "/" + target;
  } else if (targetClass.includes("folder")) {
    desired = pathTexts + "/" + target + "/";
  }
  const downloadFileRes = await downloadShareFo(shareToken, desired);
  if (downloadFileRes.status === 200) {
		window.open(downloadFileRes.downloadUrl, "_self");
	}
});