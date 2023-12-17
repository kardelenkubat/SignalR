// Doküman yüklendiğinde çalışacak kodlar
$(document).ready(() => {
    // SignalR HubConnectionBuilder'ı başlatma ve yapılandırma
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7040/chat", {
            skipNegotiation: true, // Negosyasyon aşamasını atla
            transport: 1 // Taşıma yöntemi olarak WebSockets kullan
        })
        .withAutomaticReconnect([1000, 2000, 30000, 100000]) // Otomatik yeniden bağlanma ayarları
        .build();

    // Bağlantı ve kullanıcı durumlarını göstermek için HTML elementlerini seçme
    const connectionState = $("#connectionState");
    const userState = $("#userState");

    // SignalR Hub'a bağlantı başlatma
    async function start() {
        try {
            await connection.start();
            console.log("SignalR Hub'a bağlanıldı");
            // Bağlantı durumunu güncelleme
            connectionState.text('Connected').css("background-color", "lightgreen");
        } catch (error) {
            console.error("SignalR Hub bağlantı hatası: ", error);
            // Bağlantı hatası durumunu güncelleme
            connectionState.text('Disconnected').css("background-color", "red");
            setTimeout(start, 2000); // 2 saniye sonra yeniden dene
        }
    }

    start(); // Bağlantıyı başlat

    // Bağlantı durum değişikliklerini yöneten fonksiyonlar
    function onReconnecting() {
        connection.onreconnecting(error => {
            console.log("SignalR Hub'a yeniden bağlanılıyor...");
            connectionState.text('Reconnecting...').css("background-color", "yellow");
        });
    }

    function onReconnected() {
        connection.onreconnected(connectionId => {
            console.log("SignalR Hub yeniden bağlandı.");
            connectionState.text('Reconnected').css("background-color", "lightgreen");
        });
    }

    function onclose() {
        connection.onclose(error => {
            console.log("SignalR Hub bağlantısı kapandı.");
            connectionState.text('Disconnected').css("background-color", "red");
        });
    }

    // Bağlantı durum değişikliklerini dinleyen eventleri ata
    onReconnecting();
    onReconnected();
    onclose();

  

    // Kullanıcı bağlandığında ve ayrıldığında eventler
    connection.on("userJoined", connectionId => {
        userState.html(`${connectionId} connected.`);
    });

    connection.on("userLeaved", connectionId => {
        userState.html(`${connectionId} disconnected.`);
    });

    // Bağlı kullanıcı listesini alma event'i
    connection.on("clients", dataClients => {
        let text = dataClients.map(item => `<li> ${item} </li>`).join("");
        $("#clientsData").html(text);
    });

    // Mesaj gönderme butonu event'i
    $("#btnSendAll").click(() => {
        let message = $("#txtMessage").val();
        connection.invoke("SendMessage", message).catch(error => console.log(`error occured ${error}`));
    });
      // Mesaj alma olayı
      connection.on("Send", message => {
        $("#message").append(message + " <br>");
    });

    // Canvas ve çizim işlemleri için ayarlar
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentDrawData = null;

    const colorSelect = document.getElementById('colorSelect');
    const lineWidthSelect = document.getElementById('lineWidthSelect');

    // Canvas üzerinde çizim eventleri
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        drawLine(lastX, lastY, e.offsetX, e.offsetY);
        if (currentDrawData) {
            connection.invoke('SendDraw', currentDrawData.type, currentDrawData.startPos.toString(), currentDrawData.endPos.toString(), currentDrawData.color, currentDrawData.lineWidth)
                .catch(err => console.error(err.toString()));
        }
        lastX = e.offsetX;
        lastY = e.offsetY;
    });

    canvas.addEventListener('mouseup', () => {
        if (isDrawing && currentDrawData) {
            console.log("Sending drawing data:", currentDrawData);
            connection.invoke('SendDraw', currentDrawData.type, currentDrawData.startPos.toString(), currentDrawData.endPos.toString(), currentDrawData.color, currentDrawData.lineWidth)
                .catch(err => console.error(err.toString()));
        }
        isDrawing = false;
    });

    canvas.addEventListener('mouseout', () => {
        isDrawing = false;
    });

    // Çizim tahtasını temizleme butonu event'i
    document.getElementById('clearBoardBtn').addEventListener('click', () => {
        connection.invoke('ClearBoard').catch(err => console.error(err.toString()));
    });

    // Çizim yapma fonksiyonu
    function drawLine(x1, y1, x2, y2, color, lineWidth, emit = true) {
        ctx.beginPath();
        ctx.strokeStyle = color || colorSelect.value;
        ctx.lineWidth = lineWidth || lineWidthSelect.value;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
        if (emit) {
            currentDrawData = {
                type: 'line',
                startPos: [x1, y1],
                endPos: [x2, y2],
                color: ctx.strokeStyle,
                lineWidth: ctx.lineWidth
            };
        }
    }

    // Sunucudan gelen çizim komutlarını işleme event'i
    connection.on('ReceiveDraw', (type, startPos, endPos, color, lineWidth) => {
        const startPosArr = startPos.split(',').map(Number);
        const endPosArr = endPos.split(',').map(Number);
        console.log("Received drawing command:", { type, startPos, endPos, color, lineWidth });
        drawLine(startPosArr[0], startPosArr[1], endPosArr[0], endPosArr[1], color, lineWidth, false);
    });

    // Sunucudan gelen çizim tahtasını temizleme komutunu işleme event'i
    connection.on('ClearBoard', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // SignalR hub'ına bağlan
    connection.start().catch(err => console.error(err.toString()));
});
