$(document).ready(function(){

    $('.persianDate').each(function () {
      var pDate = persianDate($(this).attr('data-timestamp'))
      $(this).text(pDate);
    });
    $('.content img').each(function () {
      $(this).after('<figcaption class="figure-caption">'+$(this).attr('alt')+'</figcaption>')
    })
    $('.content .footnote').each(function () {
      var href = $(this).attr('href').replace('#', '');
      var hrefContent = $(document.getElementById(href)).text().replace('↩', '');
      $(this).parent().wrap('<span class="sidenote-number"></span>').after('<small class="sidenote">'+$(this).text()+': '+$(document.getElementById(href)).text().replace('↩', '')+'</small>');
    })
    })
    
    $.ajax({
      url:"/posts.json",
      dataType: 'json',
      async: false,
      success: function(data) {
        posts = data;
      }
    });
    function persianDate(timestamp) {
      var stampDate = new Date(timestamp*1000);
      var faDate = stampDate.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
      return faDate;
    }
    