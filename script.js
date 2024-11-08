const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let currentColor = "rgba(255, 255, 0, 0.5)"; // 默认颜色：黄色（自我）
let circles = [];
let isDrawing = false;
let isMoving = false;
let startX, startY;
let previewCircle = null;
let selectedCircle = null;

// 切换绘制和移动模式
document.getElementById("modeToggle").addEventListener("click", () => {
    isMoving = !isMoving;
    const modeText = isMoving ? "切换为绘制模式" : "切换为移动模式";
    document.getElementById("modeToggle").textContent = modeText;
    document.getElementById("modeToggle").style.backgroundColor = isMoving
        ? "#28A745" // 绿色表示移动模式
        : "#007BFF"; // 蓝色表示绘制模式
});

// 选择黄色圆形（自我）
document.getElementById("selectYellow").addEventListener("click", () => {
    currentColor = "rgba(255, 255, 0, 0.5)"; // 黄色
});

// 选择绿色圆形（自然）
document.getElementById("selectGreen").addEventListener("click", () => {
    currentColor = "rgba(0, 255, 0, 0.5)"; // 绿色
});

// 撤销最后一步
document.getElementById("undo").addEventListener("click", () => {
    if (circles.length > 0) {
        circles.pop();
        drawCircles();
        updateInfo();
    }
});

// 鼠标/触摸开始
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    startDraw({ offsetX: touch.clientX, offsetY: touch.clientY });
});

function startDraw(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (isMoving) {
        selectedCircle = circles.find(
            (circle) => Math.hypot(x - circle.x, y - circle.y) < circle.radius
        );
    } else if (circles.length < 2) {
        isDrawing = true;
        startX = x;
        startY = y;
        previewCircle = { x: startX, y: startY, radius: 0, color: currentColor };
    }
}

// 鼠标/触摸移动
canvas.addEventListener("mousemove", moveDraw);
canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    moveDraw({ offsetX: touch.clientX, offsetY: touch.clientY });
});

function moveDraw(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (isDrawing) {
        const radius = Math.hypot(x - startX, y - startY);
        previewCircle.radius = radius;
        drawCircles();
    } else if (selectedCircle) {
        selectedCircle.x = x;
        selectedCircle.y = y;
        drawCircles();
        updateInfo();
    }
}

// 鼠标/触摸结束
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("touchend", (event) => {
    event.preventDefault();
    endDraw();
});

function endDraw() {
    if (isDrawing && previewCircle.radius > 0) {
        circles.push(previewCircle);
        previewCircle = null;
        drawCircles();
        updateInfo();
    }
    isDrawing = false;
    selectedCircle = null;
}

// 绘制所有圆形
function drawCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle, index) => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();

        // 绘制圆心和名称
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(
            index === 0 ? "自我" : "自然",
            circle.x,
            circle.y + circle.radius + 15
        );
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    });

    // 绘制预览圆
    if (previewCircle) {
        ctx.beginPath();
        ctx.arc(
            previewCircle.x,
            previewCircle.y,
            previewCircle.radius,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}

// 更新页面信息
function updateInfo() {
    if (circles.length === 0) {
        document.getElementById("natureArea").textContent = "0";
        document.getElementById("selfArea").textContent = "0";
        document.getElementById("areaRatio").textContent = "0";
        document.getElementById("overlapArea").textContent = "0";
        document.getElementById("overlapRatio").textContent = "0";
        document.getElementById("distance").textContent = "0";
        return;
    }

    let natureArea = 0,
        selfArea = 0,
        overlapArea = 0,
        overlapRatio = 0,
        distance = 0;

    if (circles.length >= 1) {
        selfArea = Math.PI * Math.pow(circles[0].radius, 2);
    }

    if (circles.length === 2) {
        const [circle1, circle2] = circles;
        natureArea = Math.PI * Math.pow(circle2.radius, 2);
        distance = Math.hypot(circle2.x - circle1.x, circle2.y - circle1.y);

        const d = distance;
        const r1 = circle1.radius;
        const r2 = circle2.radius;

        if (d < r1 + r2) {
            if (d <= Math.abs(r1 - r2)) {
                overlapArea = Math.PI * Math.pow(Math.min(r1, r2), 2);
            } else {
                const angle1 = 2 * Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
                const angle2 = 2 * Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
                const area1 = 0.5 * r1 * r1 * (angle1 - Math.sin(angle1));
                const area2 = 0.5 * r2 * r2 * (angle2 - Math.sin(angle2));
                overlapArea = area1 + area2;
            }
        }

        overlapRatio = overlapArea / (selfArea + natureArea);
    }

    document.getElementById("natureArea").textContent = natureArea.toFixed(2);
    document.getElementById("selfArea").textContent = selfArea.toFixed(2);
    document.getElementById("areaRatio").textContent = (
        (natureArea / selfArea) || 0
    ).toFixed(2);
    document.getElementById("overlapArea").textContent = overlapArea.toFixed(2);
    document.getElementById("overlapRatio").textContent = overlapRatio.toFixed(2);
    document.getElementById("distance").textContent = distance.toFixed(2);
}
