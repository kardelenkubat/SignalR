using Microsoft.AspNetCore.SignalR;

namespace chatApp.Business
{
    public class MyBusiness
    {
       readonly IHubContext<MyHub> _hubContext;
        public MyBusiness(IHubContext<MyHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public async Task Send(string message)
        {
            await _hubContext.Clients.All.SendAsync("receiveMessage", message);

        }
        public async Task SendDraw(string type, string startPos, string endPos, string color, int lineWidth)
        {
            // Çizim verilerini tüm bağlı kullanıcılara ilet
            await _hubContext.Clients.All.SendAsync("ReceiveDraw", type, startPos, endPos, color, lineWidth);
        }
    }
}
