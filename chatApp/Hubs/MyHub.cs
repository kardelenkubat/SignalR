using chatApp.Interface;
using Microsoft.AspNetCore.SignalR;

// MyHub sınıfı, SignalR'ın Hub sınıfından türetilir ve IMessageClient arayüzünü kullanır.
public class MyHub : Hub<IMessageClient>
{
    // Tüm bağlı istemcilerin Connection ID'lerini tutan statik bir liste.
    static List<string> clients = new List<string>();

    // Bir istemci bağlandığında çalışacak olan metot.
    public override async Task OnConnectedAsync()
    {
        // Yeni bağlanan istemcinin Connection ID'sini listeye ekler.
        clients.Add(Context.ConnectionId);

        // Tüm bağlı istemcilere güncel istemci listesini ve yeni bağlanan istemciyi bildirir.
        await Clients.All.Clients(clients);
        await Clients.All.UserJoined(Context.ConnectionId);
    }

    // Tüm istemcilere mesaj göndermek için kullanılan metot.
    public async Task SendMessage(string message)
    {
        await Clients.All.Send(message);
    }

    // Bir istemci bağlantıyı kestiğinde çalışacak olan metot.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Bağlantısı kesilen istemcinin ID'sini listeden çıkarır.
        clients.Remove(Context.ConnectionId);
        // Tüm bağlı istemcilere güncel istemci listesini ve ayrılan istemciyi bildirir.
        await Clients.All.Clients(clients);
        await Clients.All.UserLeaved(Context.ConnectionId);
    }

    // Çizim yapılmasını sağlayan metot. Çizim verilerini tüm bağlı istemcilere iletir.
    public async Task SendDraw(string type, string startPos, string endPos, string color, int lineWidth)
    {
        await Clients.All.ReceiveDraw(type, startPos, endPos, color, lineWidth);
    }

    // Tüm bağlı istemcilerde çizim tahtasını temizleyen metot.
    public async Task ClearBoard()
    {
        await Clients.All.ClearBoard();
    }
}
