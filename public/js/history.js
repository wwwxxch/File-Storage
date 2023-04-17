import { getFileHistory } from "./api/list.js";
import { restoreFile } from "./api/restore.js";
import { formatTime } from "./util/util.js";

// ===================================================
// logout button
$("#logout-btn").on("click", async function (e) {
	e.preventDefault();
	const logoutReq = await axios.get("/logout");
	window.location.href = "/";
});

// check login status
const chkLoginStatus = async () => {
	try {
		await axios.get("/login-status");
		return true;
	} catch (err) {
		window.location.href = "/login";
		return false;
	}
};

const isLogin = await chkLoginStatus();
if (isLogin) {
  const reqPath = window.location.pathname;
	const fileWholePath = reqPath.replace(/^\/history\//, "");

	const history = await getFileHistory(fileWholePath);
	// console.log(history);
	const allRecords = [...history.versions, ...history.deleteRecords];
	allRecords.sort((a, b) => b.operation_time - a.operation_time);
	let recDiv;
	for (const rec of allRecords) {
		const time = formatTime(rec.operation_time);
		if (rec.operation === "delete") {
			recDiv = `
        <div style="width: 100%;" 
            class="rec deleted-rec d-flex justify-content-between align-items-center py-3">
          <div class="operation-time col-3">${time}</div>
          <div class="action col-3">${rec.operation}</div>
          <div class="col-4 d-flex justify-content-between align-items-center">
            <div class="size"></div>
            <div class="restore"></div>
          </div>
        <div>
      `;
		} else if (rec.operation) {
			let showSize;
			if (rec.size < 1024) {
				showSize = `${rec.size} bytes`;
			} else if (rec.size < 1024 * 1024) {
				showSize = `${Math.ceil(rec.size / 1024)} KB`;
			} else if (rec.size < 1024 * 1024 * 1024) {
				showSize = `${Math.ceil(rec.size / (1024 * 1024))} MB`;
			} else if (rec.size < 1024 * 1024 * 1024 * 1024) {
				showSize = `${Math.ceil(rec.size / (1024 * 1024 * 1024))} GB`;
			}

			if (rec.is_current === 1) {
				recDiv = `
        <div style="width: 100%;" 
            class="rec current-rec d-flex justify-content-between align-items-center py-3">
            <div class="operation-time col-3">${time}</div>
            <div class="action col-3">${rec.operation}</div>
            <div class="col-4 d-flex justify-content-between align-items-center">
              <div class="size">${showSize}</div>
              <div class="current">
                <button class="current-btn btn btn-outline-secondary" disabled>
                  Current Version
                </button>
              </div>
            </div>
          <div>
        `;
			} else {
				const restoreDiv = `
          <button class="restore-btn btn btn-outline-secondary" data-version="${rec.ver}">
            Restore
          </button>
        `;
				recDiv = `
          <div style="width: 100%;" 
              class="rec previous-rec d-flex justify-content-between align-items-center py-3">
            <div class="operation-time col-3">${time}</div>
            <div class="action col-3">${rec.operation}</div>
            <div class="col-4 d-flex justify-content-between align-items-center">
              <div class="size">${showSize}</div>
              <div class="restore">${restoreDiv}</div>
            </div>
          <div>
        `;
			}
		}
		$("#file-history").append(recDiv);
	}

  $(".rec").on("click", ".restore-btn", async function () {
    const version = $(this).data("version");
    // call recover function with version
    console.log("recover version: ", version);
    console.log("fileWholePath: ", fileWholePath);

    const arr = fileWholePath.split("/");
    const parentPath = arr.slice(0, arr.length-1).join("/");
    console.log("parentPath: ", parentPath);

    const askRestore = await restoreFile(version, fileWholePath, parentPath);
    console.log("askRestore: ", askRestore);
  });
}