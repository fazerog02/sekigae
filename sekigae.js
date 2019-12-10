let last_x, last_y;

function getRandom(min, max){return Math.floor(Math.random()*(max-min))+min}

function shuffle(array) {
    let len = array.length;
    let rnd, tmp;
    for(let i = 0; i < len; i++){
        rnd = getRandom(0, len-1);
        tmp = array[i];
        array[i] = array[rnd];
        array[rnd] = tmp;
    }
    return array;
}

const DEFAULT_LINE_NUM = 7;
function createBox(people_num) {
    let boxes = [], box;
    /* 机のサイズと配置のもととなる変数を生成 */
    let box_width_vw = Math.floor(100/DEFAULT_LINE_NUM*0.8);
    let box_hor_margin_vw = Math.floor(100/DEFAULT_LINE_NUM*0.2);
    let box_height_vh = Math.floor(100/(people_num/DEFAULT_LINE_NUM+1)*0.8);
    let box_ver_margin_vh = Math.floor(100/(people_num/DEFAULT_LINE_NUM)*0.2);
    /* 人数分机を生成する */
    for(let i = 0; i < people_num; i++){
        /* 机を生成する */
        box = document.createElement("div");
        box.classList.add("box");
        box.classList.add("drag");
        box.classList.add("selected");
        box.style.width = box_width_vw+"vw";
        box.style.height = box_height_vh+"vh";
        box.style.position = "absolute";
        box.style.left = box_hor_margin_vw+(i%DEFAULT_LINE_NUM)*(box_width_vw+box_hor_margin_vw)+"vw";
        box.style.top = box_ver_margin_vh+Math.floor(i/DEFAULT_LINE_NUM)*(box_height_vh+box_ver_margin_vh)+"vh";
        /* 右クリック時の動作 */
        box.addEventListener("contextmenu", function(e){
            // コンテキストメニューを出さないようにする
            e.preventDefault();
            /* すでに選択されていたら解除、されていなかったら選択 */
            if(this.classList.contains("selected")){
                this.classList.remove("selected");
            }else {
                this.classList.add("selected");
            }
        });
        /* 出席番号の表示欄を生成 */
        let seat_num_input = document.createElement("input");
        seat_num_input.type = "number";
        seat_num_input.value = null;
        seat_num_input.style.position = "relative";
        seat_num_input.style.width = "80%";
        seat_num_input.style.height = "60%";
        seat_num_input.style.top = "15%";
        seat_num_input.style.fontSize = "200%";
        seat_num_input.style.textAlign = "center";
        box.appendChild(seat_num_input);
        document.body.appendChild(box);
        boxes.push(box);
    }
}

/* 全ての机を選択 */
function selectAll(){
    let boxes = document.getElementsByClassName("box");
    for(let i = 0; i < boxes.length; i++){
        if(!boxes[i].classList.contains("selected")) boxes[i].classList.add("selected");
    }
}

/* 全ての机を選択解除 */
function unselectAll(){
    let boxes = document.getElementsByClassName("box");
    for(let i = 0; i < boxes.length; i++){
        if(boxes[i].classList.contains("selected")) {
            boxes[i].classList.remove("selected");
        }
    }
}

/* 全ての机を出席番号で埋める */
function fillBox(){
    let boxes = document.getElementsByClassName("box");
    let empty_boxes = [];
    let seat_nums = [];
    let ignore_seat_nums = [];
    for(let i = 0; i < boxes.length; i++){
        if(boxes[i].firstChild.value != ""){
            ignore_seat_nums.push(boxes[i].firstChild.value);
        }else{
            empty_boxes.push(boxes[i]);
        }
    }
    for(let i = 1; i <= boxes.length; i++){
        // すでに入力されている出席番号は除外する
        if(!ignore_seat_nums.includes(i.toString())) seat_nums.push(i);
    }
    seat_nums = shuffle(seat_nums);
    for(let i = 0; i < empty_boxes.length; i++){
        empty_boxes[i].firstChild.value = seat_nums[i];
    }
}

/* 選択された机にランダムで出席番号をセットする */
function setRandom(){
    let selected_boxes = document.getElementsByClassName("box selected");
    let seat_nums = [];
    for(let i = 0; i < selected_boxes.length; i++){
        seat_nums.push(selected_boxes[i].firstChild.value);
    }
    seat_nums = shuffle(seat_nums);
    let box;
    for(let i = 0; i < selected_boxes.length; i++){
        selected_boxes[i].firstChild.value = seat_nums[i];
    }
}

/* キーバインドの設定 */
function initKeybind(){
    document.addEventListener("keydown", function(e){
        // Shift+
        if(e.shiftKey) {
            switch (e.key) {
                case "R":
                    setRandom();
                    break;
                case "S":
                    selectAll();
                    break;
                case "U":
                    unselectAll();
                    break;
                case "F":
                    fillBox();
                    break;
            }
        }
    });
}

function dragInit(){
    let drag_objs = document.getElementsByClassName("drag");
    /* drag movableクラスの要素をマウスの移動分動かす */
    document.addEventListener("mousemove", function(e){
        let client_rect, diff_x, diff_y;
        for(let i  = 0; i < drag_objs.length; i++){
            if(drag_objs[i].classList.contains("movable")){
                client_rect = drag_objs[i].getBoundingClientRect();
                diff_x = last_x-e.clientX;
                diff_y = last_y-e.clientY;
                drag_objs[i].style.left = client_rect.left-diff_x+"px";
                drag_objs[i].style.top = client_rect.top-diff_y+"px";
                last_x = e.clientX;
                last_y = e.clientY;
            }
        }
    });
    /* マウスのクリックを離したらmovableクラスの削除して、z-indexを もとに戻す*/
    document.addEventListener("mouseup", function(e){
        for(let i = 0; i < drag_objs.length; i++){
            drag_objs[i].classList.remove("movable");
            drag_objs[i].style.zIndex = "10";
        }
    });
    /* 机を左クリックホールドしたらz-indexを他より高くして、movableクラスを追加する */
    for(let i  = 0; i < drag_objs.length; i++){
        drag_objs[i].ondragstart = function(){return false;};
        drag_objs[i].addEventListener("mousedown", function(e){
            if(e.button == 0) {
                this.classList.add("movable");
                this.style.zIndex = "100";
                /* クリック時の座標を保存 */
                last_x = e.clientX;
                last_y = e.clientY;
            }
        });
    }
}

/* 最初の設定 */
function init() {
    let num_people = document.getElementById("people_num").value;
    document.body.style.margin="0px";
    document.body.innerHTML = "<p style='text-align: center;margin: 0px'>-----黒板-----</p>";
    createBox(num_people);
    initKeybind();
    dragInit();
}