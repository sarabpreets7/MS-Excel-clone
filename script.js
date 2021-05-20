//const { callbackify } = require("node:util");

let s = $("#columns");
const ps = new PerfectScrollbar('#cells');
for (let i = 1; i <= 100; i++) {
    let str = "";
    let n = i;
    while (n > 0) {
        let rem = n % 26;
        if (rem == 0) {
            str = "Z" + str;
            n = Math.floor(n / 26) - 1;

        }
        else {
            str = String.fromCharCode((rem - 1) + 65) + str;
            n = Math.floor(n / 26);

        }
    }
    s.append(`<div class="column-name">${str}</div>`)

}
for (let i = 2; i <= 100; i++) {
    $("#rows").append(`<div class=row-name>${i}</div>`);
}
$("#cells").scroll(function () {
    $("#columns").scrollLeft(this.scrollLeft);
    $("#rows").scrollTop(this.scrollTop);
});

let cellData = { "sheet1": {} };
let saved = true;
let totalSheets = 1;
let selectedSheet = "sheet1";
let defaultProperties = {
    "font-family": "Noto Sans",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italic": false,
    "underlined": false,
    "alignment": "left",
    "color": "#444",
    "bgcolor": "#fff"
};
//console.log(selectedSheet);
function loadNewSheet() {
    $("#cells").text("");
    for (let i = 1; i <= 100; i++) {
            let row = $('<div class="cell-row"></div>');
            for (let j = 1; j <= 100; j++) {
                row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`);
            }
            $("#cells").append(row);
        }
    

    addEventsToSheet();

    addSheetEvents();

}



loadNewSheet();
//addSheetEvents();
addSheet();



//console.log("helo")




function addSheet() {
    $(".add-sheet").click(function (e) {

        addLoader();
        emptySheet();
        totalSheets += 1;

        //console.log(totalSheets);
        if (!cellData[`sheet${totalSheets}`]) {
            cellData[`sheet${totalSheets}`] = {};
            selectedSheet = `sheet${totalSheets}`;
            $(".sheet-tab.selected").removeClass("selected");
            $(".sheet-tab-container").append(`<div class="sheet-tab selected">sheet${totalSheets}</div>`)
            setTimeout(() => {
                loadNewSheet();
                removeLoader();
            }, 10)
        }
        //$("#row-1-col-1").click()
        saved = false;
    })
}
function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if (topCell) {
        topCell.removeClass("bottom-selected");

    }

    if (bottomCell) {
        bottomCell.removeClass("top-selected");

    }

    if (leftCell) {
        leftCell.removeClass("right-selected")

    }
    if (rightCell) {
        rightCell.removeClass("left-selected");

    }
    $(ele).removeClass("selected top-selected left-selected right-selected bottom-selected");

}
function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell, mouseSelection) {

    if (e.ctrlKey || mouseSelection) {


        //console.log(rowId,colId);


        let topSelected;
        let bottomSelected;
        let leftSelected;
        let rightSelected;

        //console.log(topCell,leftCell)
        if (topCell) {

            topSelected = topCell.hasClass("selected");
            //console.log(topSelected)
        }

        if (bottomCell) {
            bottomSelected = bottomCell.hasClass("selected");
            // console.log(bottomSelected)
        }



        if (leftCell) {
            leftSelected = leftCell.hasClass("selected");
            //console.log(leftSelected)
        }

        if (rightCell) {
            rightSelected = rightCell.hasClass("selected");
            // console.log(rightSelected)
        }


        if (topSelected) {
            topCell.addClass("bottom-selected")
            $(ele).addClass("top-selected")

        }

        if (leftSelected) {
            leftCell.addClass("right-selected")
            $(ele).addClass("left-selected")

        }
        if (rightSelected) {
            rightCell.addClass("left-selected")
            $(ele).addClass("right-selected")

        }
        if (bottomSelected) {
            bottomCell.addClass("top-selected")
            $(ele).addClass("bottom-selected")

        }


    }

    else {
        $(".input-cell.selected").removeClass("selected top-selected left-selected right-selected bottom-selected")


    }

    $(ele).addClass("selected");
    changeHeader(findRowCol(ele), "bold");
    changeHeader(findRowCol(ele), "italic");
    changeHeader(findRowCol(ele), "underlined");



}
function changeHeader([rowid, colid], type) {
    let cell;
    if (cellData[selectedSheet][rowid - 1] && cellData[selectedSheet][rowid - 1][colid - 1]) {
        cell = cellData[selectedSheet][rowid - 1][colid - 1];
    }
    else {
        cell = defaultProperties;
    }
    //console.log(cell);
    // let cell = cellData[selectedSheet][rowid - 1][colid - 1];
    // console.log(cell.alignment);
    $(".alignment.selected").removeClass("selected");
    $(`.alignment[data-type=${cell.alignment}]`).addClass("selected")
    $($(".menu-selector")[0]).val(cell["font-family"])
    $($(".menu-selector")[1]).val(cell["font-size"])
    $("#fill-color-icon").css("border-bottom",`4px solid ${cell.bgcolor}`);
    $("#text-color-icon").css("border-bottom",`4px solid ${cell.color}`)
    if (cell[type]) {
        $(`#${type}`).addClass("selected")
    }
    else {
        $(`#${type}`).removeClass("selected");
    }
}

let mousemoved = false;
let startcellStored = false;
let startCell;
let endCell;

// for(let r= start.rowid<end.rowid?start.rowid:end.rowid;r<=start.rowid<end.rowid?end.rowid:start.rowid;r++){
//     for(let c=start.colid<end.colid?start.colid:end.colid;c<=start.colid<end.colid?end.colid:start.colid;c++){
//         let[topCell, bottomCell, leftCell, rightCell] = getTopBottomLeftRightCell(c,r);
//         //console.log(c,r)
//         console.log(topCell,bottomCell,leftCell,rightCell)
//         selectCell($(`#row-${c}-col-${r}`)[0],{},topCell,bottomCell,leftCell,rightCell,true);
//     }
// }

function selectAllInBetween(start, end) {
    $(".input-cell.selected").removeClass("selected top-selected left-selected right-selected bottom-selected")
    for (let r = (start.rowid < end.rowid ? start.rowid : end.rowid); r <= (start.rowid < end.rowid ? end.rowid : start.rowid); r++) {
        for (let c = (start.colid < end.colid ? start.colid : end.colid); c <= (start.colid < end.colid ? end.colid : start.colid); c++) {
            let [topCell, bottomCell, leftCell, rightCell] = getTopBottomLeftRightCell(r, c);
            //console.log(c,r)
            //console.log(topCell, bottomCell, leftCell, rightCell)
            selectCell($(`#row-${r}-col-${c}`)[0], {}, topCell, bottomCell, leftCell, rightCell, true);
        }
    }
    // for(let r= start.rowid;r<=end.rowid;r++){
    //     for(let c=start.colid;c<=end.colid;c++){
    //         let[topCell, bottomCell, leftCell, rightCell] = getTopBottomLeftRightCell(c,r);
    //         //console.log(c,r)
    //         console.log(topCell,bottomCell,leftCell,rightCell)
    //         selectCell($(`#row-${c}-col-${r}`)[0],{},topCell,bottomCell,leftCell,rightCell,true);
    //     }
    // }
}

function findRowCol(ele) {
    let idArray = $(ele).attr("id").split("-");
    //console.log(idArray);
    let rowId = parseInt(idArray[1]);
    let colId = parseInt(idArray[3]);
    //console.log(rowId,colId)
    return [rowId, colId];
}
function getTopBottomLeftRightCell(rowId, colId) {

    let topCell = $(`#row-${rowId - 1}-col-${colId}`);
    let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
    let rightCell = $(`#row-${rowId}-col-${colId + 1}`);
    return [topCell, bottomCell, leftCell, rightCell];
}
$("#bold").click(function (e) {
    setFontStyle(this, "font-weight", "bold", "bold");
})

$("#italic").click(function (e) {
    setFontStyle(this, "font-style", "italic", "italic")
})
$("#underlined").click(function (e) {
    setFontStyle(this, "text-decoration", "underline", "underlined")
})
$(".alignment").click(function (e) {

    $(".alignment.selected").removeClass("selected");
    $(this).addClass("selected");
    let alignment = $(this).attr("data-type");
    $(".input-cell.selected").css("text-align", alignment);
    // $(".input-cell.selected").each(function (idx, data) {
    //     let [row, col] = findRowCol(data);
    //     let cell = cellData[selectedSheet][row - 1][col - 1];
    //     cell.alignment = alignment;
    updateCellData("alignment", alignment)


})
function emptySheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text("");
            cell.css({
                "font-family": "Noto Sans",
                "font-size": 14,
                "background-color": "#fff",
                "color": "#444",
                "font-weight": "",
                "font-style": "",
                "text-decoration": "",
                "text-align": "left"
            })
        }
    }
}
function loadSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text(data[rowId][colId].text);
            cell.css({
                "font-family": data[rowId][colId]["font-family"],
                "font-size": data[rowId][colId]["font-size"],
                "background-color": data[rowId][colId]["bgcolor"],
                "color": data[rowId][colId].color,
                "font-weight": data[rowId][colId].bold ? "bold" : "",
                "font-style": data[rowId][colId].italic ? "italic" : "",
                "text-decoration": data[rowId][colId].underlined ? "underline" : "",
                "text-align": data[rowId][colId].alignment
            })
        }
    }
}

function setFontStyle(ele, key, value, type) {
    if ($(ele).hasClass("selected")) {
        $(ele).removeClass("selected");
        $(".input-cell.selected").css(key, "");
        // $(".input-cell.selected").each(function (index, data) {
        //     let [rowId, colId] = findRowCol(data);
        //     cellData[selectedSheet][rowId - 1][colId - 1][type] = false;
        // })
        updateCellData(type, false);

    }
    else {
        $(ele).addClass("selected");
        $(".input-cell.selected").css(key, value);
        // $(".input-cell.selected").each(function (index, data) {
        //     let [rowId, colId] = findRowCol(data);
        //     cellData[selectedSheet][rowId - 1][colId - 1][type] = true;
        // })
        updateCellData(type, true);
    }
}
$(".menu-selector").change(function (e) {
    let key = "";
    let value = $(this).val();
    if (isNaN(value)) {
        key = "font-family"
    }
    else {
        key = "font-size";
        value = parseInt(value);
    }
    $(".input-cell.selected").css(key, value);
    // $(".input-cell.selected").each(function (idx, data) {
    //     let [row, col] = findRowCol(data);
    //     cellData[selectedSheet][row - 1][col - 1][key] = value;
    // })
    updateCellData(key, value);
})

$(".color-pick").colorPick({
    'initialColor': '#TYPECOLOR',
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        if (this.color != "#TYPECOLOR") {
            if(this.element.attr("id")=="fill-color"){
                $("#fill-color-icon").css("border-bottom",`4px solid ${this.color}`);
                $(".input-cell.selected").css("background-color",this.color);
                updateCellData("bgcolor",this.color);
                console.log(this.color);
            }
            else{(this.element.attr("id")=="text-color")
                $("#text-color-icon").css("border-bottom",`4px solid ${this.color}`);
                $(".input-cell.selected").css("color",this.color);
                updateCellData("color",this.color);
            }
        }
    }

});





function selectSheet(ele) {
    addLoader();
    $(".sheet-tab.selected").removeClass("selected");
    $(ele).addClass("selected");
    emptySheet();
    selectedSheet = $(ele).text();
    //console.log(selectedSheet);
    setTimeout(() => {
        loadSheet();
        removeLoader();
    }, 10)
}
$(".container").click(function (e) {
    $(".sheet-options-modal").remove();
    //$("#row-1-col-1").click();
})


let cell = false;

function addSheetEvents() {

    $(".sheet-tab").off("bind", "click", "dbclick");

    $(".sheet-tab").click(function (e) {
        if (!$(this).hasClass("selected")) {
            selectSheet(this);
        }

    })

    $(".sheet-tab").blur(function (e) {
        $(".sheet-tab").attr("contenteditable", "false")
    })
    $(".sheet-tab.selected").click(function (e) {
        if (!$(this).hasClass("selected")) {
            addLoader()

            selectSheet(this);

        }

    })

    $(".sheet-tab.selected").bind("contextmenu", function (e) {
        e.preventDefault();
        $(".sheet-options-modal").remove();

        let modal = $(`<div class="sheet-options-modal">
        <div class="option sheet-rename">Rename</div>
        <div class="option sheet-delete">Delete</div>
    </div>`);;

        $(".container").append(modal);
        $(".sheet-options-modal").css({ "bottom": 0.06 * $(".container").height(), "left": e.pageX })
        $(".sheet-rename").click(function (e) {
            let renameModal = $(`<div class="sheet-modal-parent">
                <div class="sheet-rename-modal">
                    <div class="sheet-modal-title">
                        <span>Rename Sheet</span>
                    </div>
                    <div class="sheet-modal-input-container">
                        <span class="sheet-modal-input-title">Rename Sheet to:</span>
                        <input class="sheet-modal-input" type="text">
                    </div>
                    <div class="sheet-modal-confirmation">
                        <div class="button ok-button">OK</div>
                        <div class="button cancel-button">Cancel</div>
                    </div>
                </div>`);
            $(".container").append(renameModal);
            $(".cancel-button").click(function (e) {
                $(".sheet-modal-parent").remove();
            })

            $(".ok-button").click(function (e) {
                renameSheet();
            })

            $(".sheet-modal-input").keypress(function (e) {
                if (e.key == "Enter") {
                    renameSheet();
                }
            })


        })
        $(".sheet-delete").click(function (e) {
            let deleteModal = $(`<div class="sheet-modal-parent">
            <div class="sheet-delete-modal">
                <div class="sheet-modal-title">
                    <span>Sheet Name</span>
                </div>
                <div class="sheet-modal-detail-container">
                    <span class="sheet-modal-detail-title">Are you sure?</span>
                </div>
                <div class="sheet-modal-confirmation">
                    <div class="button delete-button">
                        <div class="material-icons delete-icon">delete</div>
                        Delete
                    </div>
                    <div class="button cancel-button">Cancel</div>
                </div>
            </div>
        </div>`)

            $(".container").append(deleteModal);
            $(".cancel-button").click(function (e) {
                $(".sheet-modal-parent").remove();
            })
            $(".delete-button").click(function (e) {
                if (totalSheets > 1) {
                    $(".sheet-modal-parent").remove();
                    let keysArray = Object.keys(cellData);
                    let selectedSheetIndex = keysArray.indexOf(selectedSheet);
                    let currentSelectedSheet = $(".sheet-tab.selected");
                    if (selectedSheetIndex == 0) {
                        selectSheet(currentSelectedSheet.next()[0]);
                    } else {
                        selectSheet(currentSelectedSheet.prev()[0]);
                    }
                    delete cellData[currentSelectedSheet.text()];
                    currentSelectedSheet.remove();
                    // selectSheet($(".sheet-tab.selected")[0]);
                    totalSheets--;
                    saved = false;
                } else {

                }
            })

        })
        if (!$(this).hasClass("selected")) {
            selectSheet(this);
        }

    })

}
function updateCellData(property, value) {
    let prevData = JSON.stringify(cellData);
    if (value != defaultProperties[property]) {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = findRowCol(data);
            if (cellData[selectedSheet][rowId - 1] == undefined) {
                cellData[selectedSheet][rowId - 1] = {};
                cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
            }
            else {
                if (cellData[selectedSheet][rowId - 1][colId - 1] == undefined) {
                    cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                }
                else {
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                }
            }
        })
    }
    else {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = findRowCol(data);
            if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                if (JSON.stringify(cellData[selectedSheet][rowId - 1][colId - 1]) == JSON.stringify(defaultProperties)) {
                    delete cellData[selectedSheet][rowId - 1][colId - 1];
                    if (Object.keys(cellData[selectedSheet][rowId - 1].length == 0)) {
                        delete cellData[selectedSheet[rowId - 1]];
                    }
                }
            }
        })
    }
    if (saved && JSON.stringify(cellData) != prevData) {
        saved = false;
    }
}
function renameSheet() {
    let newSheetName = $(".sheet-modal-input").val();
    if (newSheetName && !Object.keys(cellData).includes(newSheetName)) {
        let newCellData = {};
        for (let i of Object.keys(cellData)) {
            if (i == selectedSheet) {
                newCellData[newSheetName] = cellData[i];
            }
            else {
                newCellData[i] = cellData[i];
            }
        }
        cellData = newCellData;
        // let data = cellData[selectedSheet];
        // cellData[newSheetName] = data;
        // delete cellData[selectedSheet];
        selectedSheet = newSheetName;
        $(".sheet-tab.selected").text(newSheetName);
        $(".sheet-modal-parent").remove();
        saved = false;

    }
    else {
        $(".error").remove();
        $(".sheet-modal-input-container").append(`
        <div class="error">Enter a valid name`);
    }
}
function addLoader() {
    $(".container").append(`<div class="sheet-modal-parent loader-parent">
                                <!--<div class="loading-image"><img src="loader.gif" /></div>-->
                                <div class="loading">Loading...</div>
                            </div>`);
}
function removeLoader() {
    $(".loader-parent").remove();
}
function addEventsToSheet() {
    // $("#cells").scroll(function () {
    //     // console.log(this.scrollLeft)
    //     $("#columns").scrollLeft(this.scrollLeft)
    //     $("#rows").scrollTop(this.scrollTop);
    // })

    $(".input-cell").dblclick(function () {

        $(this).attr("contenteditable", "true")
        $(this).focus();
    })

    $(".input-cell").blur(function () {
        $(this).attr("contenteditable", "false");
        let [row, col] = findRowCol(this);
        //cellData[selectedSheet][row - 1][col - 1].text = $(this).text();
        updateCellData("text", $(this).text());


    })

    $(".input-cell").click(function (e) {
        let idArray = $(this).attr("id").split("-");

        let rowId = parseInt(idArray[1]);
        let colId = parseInt(idArray[3]);
        //console.log(rowId, colId)
        let topCell = $(`#row-${rowId - 1}-col-${colId}`);
        let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
        let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
        let rightCell = $(`#row-${rowId}-col-${colId + 1}`);

        if ($(this).hasClass("selected") && e.ctrlKey && $(this).attr("contenteditable") == "false") {
            unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
        }
        else {
            selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
        }


    })


    $(".input-cell").mousemove(function (event) {
        event.preventDefault();
        //console.log(event);
        if (event.buttons == 1) {
            if (event.buttons == 1 && !startcellStored) {
                startcellStored = true;
                mousemoved = true;
                let [rowId, colId] = findRowCol(event.target);
                startCell = { rowid: rowId, colid: colId }
            }
            else if (event.buttons = 1 && startcellStored) {
                let [rowId, colId] = findRowCol(event.target);
                endCell = { rowid: rowId, colid: colId };
                // console.log(startCell,endCell)
                selectAllInBetween(startCell, endCell);
            }

        }
        else {
            mousemoved = false;
            startcellStored = false;
        }

    })

}
$(".left-scroller").click(function (e) {
    let array = Object.keys(cellData);
    let selectedheetIndex = array.indexOf(selectedSheet);
    if (selectedheetIndex != 0) {
        selectSheet($(".sheet-tab.selected").prev()[0]);
    }
})

$(".right-scroller").click(function (e) {
    let array = Object.keys(cellData);
    let selectedheetIndex = array.indexOf(selectedSheet);
    if (selectedheetIndex != (array.length - 1)) {
        selectSheet($(".sheet-tab.selected").next()[0]);
    }
})

$("#menu-file").click(function (e) {
    let fileModal = $(`<div class="file-modal">
    <div class="file-options-modal">
        <div class="close">
            <div class="material-icons close-icon">arrow_circle_down</div>
            <div>Close</div>
        </div>
        <div class="new">
            <div class="material-icons new-icon">insert_drive_file</div>
            <div>New</div>
        </div>
        <div class="open">
            <div class="material-icons open-icon">folder_open</div>
            <div>Open</div>
        </div>
        <div class="save">
            <div class="material-icons save-icon">save</div>
            <div>Save</div>
        </div>
    </div>
    <div class="file-recent-modal">
    </div>
    <div class="file-transparent-modal"></div>
</div>`)
$(".container").append(fileModal);
fileModal.animate({
    "width":"100vw"
},300)
$(".file-transparent-modal").click(function(e){
    console.log("hello")
    fileModal.animate({
        "width":"0vw"
    },300);
    setTimeout(() => {
        fileModal.remove();
    }, 300);
})
$(".close").click(function(e){
    fileModal.animate({
        "width":"0vw"
    },300);
    setTimeout(() => {
        fileModal.remove();
    }, 300);
})
$(".open").click(function(e){
    openFile();

})
$(".new").click(function(e){
    if(saved){
        newFile();
    }
    else{
        $(".container").append(`<div class="sheet-modal-parent">
        <div class="sheet-delete-modal">
            <div class="sheet-modal-title">
                <span>${$(".title-bar").text()}</span>
            </div>
            <div class="sheet-modal-detail-container">
                <span class="sheet-modal-detail-title">Do you want to save changes?</span>
            </div>
            <div class="sheet-modal-confirmation">
                <div class="button ok-button">
                    Save
                </div>
                <div class="button cancel-button">Cancel</div>
            </div>
        </div>
    </div>`)
    $(".ok-button").click(function(e){
        $(".sheet-modal-parent").remove();
        saveFile(true);
    })

    $(".cancel-button").click(function(e){
        $(".sheet-modal-parent").remove();
        newFile();
    })
    }
})
$(".save").click(function(e){
    saveFile();
})


})

function newFile(){
    emptySheet();
    $(".sheet-tab").remove();
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">sheet1</div>`);
    cellData = {"sheet1": {}};
    selectedSheet = "sheet1";
    totalSheets = 1;
    //lastlyAddedSheetNumber = 1;
    //addSheetTabEventListeners();
   // addEventsToSheet();
    addSheetEvents();
    //addSheet();
    //$("#row-1-col-1").click();
}

function saveFile(createNewFile){
    if(!saved){
        $(".container").append(`<div class="sheet-modal-parent">
        <div class="sheet-rename-modal">
            <div class="sheet-modal-title">
                <span>Save File</span>
            </div>
            <div class="sheet-modal-input-container">
                <span class="sheet-modal-input-title">File Name:</span>
                <input class="sheet-modal-input" value='${$(".title-bar").text()}' type="text" />
            </div>
            <div class="sheet-modal-confirmation">
                <div class="button ok-button">Save</div>
                <div class="button cancel-button">Cancel</div>
            </div>
        </div>
    </div>`);
    }
    $(".ok-button").click(function(e){
        let fileName = $(".sheet-modal-input").val();
        if(fileName){
            let href = `data:application/json,${encodeURIComponent(JSON.stringify(cellData))}`;
            let a = $(`<a href=${href} download="${fileName}.json"</a>`)
            $(".container").append(a);
            a[0].click();
            a.remove();
            $(".sheet-modal-parent").remove();
            saved=true;
            if(createNewFile){
                newFile();
            }
        }
    })
    $(".cancel-button").click(function(e){
        $(".sheet-modal-parent").remove();
        if(createNewFile){
            newFile();
        }
    })

}
function openFile(){
    let inputFile =  $(`<input accept="application/json" type="file" />`);
    $(".container").append(inputFile);
    inputFile.click();
    inputFile.change(function(e){
        let file = e.target.files[0];
        $(".title-bar").text(file.name.split(".json")[0]);
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(){
            emptySheet();
            $(".sheet-tab").remove();
            cellData = JSON.parse(reader.result);
            let sheets = Object.keys(cellData);
            for(let e of sheets){
                $(".sheet-tab-container").append(`<div class="sheet-tab selected">${e}</div>`)
            }
            addSheetEvents();
            $(".sheet-tab").removeClass("selected");
            $($(".sheet-tab")[0]).addClass("selected");
            selectedSheet = sheets[0];
            totalSheets = sheets.length;
            loadSheet();
            inputFile.remove();
            $(".close").click();

        }
    })
}