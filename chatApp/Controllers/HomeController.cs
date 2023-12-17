using chatApp.Business;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace chatApp.Controllers
{
    // HomeController, API controller'ı olarak tanımlanır ve route ayarı yapılır.
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        // MyBusiness sınıfından bir nesne ve SignalR HubContext.
        readonly MyBusiness _myBusiness;
        readonly IHubContext<MyHub> _hubContext;

        // HomeController'un yapıcı metodunda MyBusiness ve HubContext bağımlılıkları enjekte edilir.
        public HomeController(MyBusiness myBusiness, IHubContext<MyHub> hubContext)
        {
            _myBusiness = myBusiness;
            _hubContext = hubContext;
        }

        // 'send-message' endpoint'i için HTTP GET metodu.
        // Bu metod, gelen mesajı MyBusiness sınıfı üzerinden tüm bağlı istemcilere gönderir.
        [HttpGet("send-message")]
        public async Task<IActionResult> SendMessage(string message)
        {
            await _myBusiness.Send(message);
            return Ok(); // İşlem başarılı olduğunda HTTP 200 OK yanıtı döndürür.
        }

        // 'send-draw' endpoint'i için HTTP GET metodu.
        // Bu metod, çizim verilerini alır ve MyBusiness sınıfı aracılığıyla tüm bağlı istemcilere gönderir.
        [HttpGet("send-draw")]
        public async Task<IActionResult> SendDraw(string type, string startPos, string endPos, string color, int lineWidth)
        {
            await _myBusiness.SendDraw(type, startPos, endPos, color, lineWidth);
            return Ok(); // İşlem başarılı olduğunda HTTP 200 OK yanıtı döndürür.
        }
    }
}
