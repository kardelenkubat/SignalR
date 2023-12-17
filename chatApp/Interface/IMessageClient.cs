namespace chatApp.Interface
{
    // IMessageClient, SignalR ile istemciye gönderilecek mesajların arayüzünü tanımlar.
    public interface IMessageClient
    {
        // Tüm bağlı istemcilerin listesini istemcilere gönderir.
        Task Clients(List<string> clients);

        // Bir istemcinin bağlandığını tüm istemcilere bildirir.
        Task UserJoined(string connectionId);

        // Bir istemcinin ayrıldığını tüm istemcilere bildirir.
        Task UserLeaved(string connectionId);

        // Tüm istemcilere genel bir mesaj gönderir.
        Task Send(string message);

        // Tüm istemcilerde çizim tahtasını temizlemek için kullanılır.
        Task ClearBoard();

        // Çizim verilerini almak ve bu verileri istemcilere göndermek için kullanılır.
        // Parametreler arasında çizim tipi, başlangıç ve bitiş pozisyonları, renk ve çizgi kalınlığı bulunur.
        Task ReceiveDraw(string type, string startPos, string endPos, string color, int lineWidth);
    }
}
