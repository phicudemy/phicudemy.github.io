$(document).ready(function(){
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    $('.persianDate').each(function () {
      var pDate = persianDate($(this).attr('data-timestamp'))
      $(this).text(pDate);
    });
    $('.persianMonth').each(function () {
      var pDate = persianMonth($(this).attr('data-timestamp'))
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
    $('button.content').on('click', function(e){
      $(this).addClass('active').parent().siblings().children().removeClass('active');
      if ($(this).val()){
        $('.content-card').hide();
        $('.'+$(this).val()).fadeIn('slow');
      } else {
        $('.content-card').fadeIn('slow');
      }
    })
    $('button.event').on('click', function(e){
      $(this).addClass('active').parent().siblings().children().removeClass('active');
      if ($(this).val()){
        $('.event-card').hide();
        $('.'+$(this).val()).fadeIn('slow');
      } else {
        $('.event-card').fadeIn('slow');
      }
    })
  
  
    })
    
    $.ajax({
      url:"/posts.json?v=0.6",
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
    function persianMonth(timestamp) {
      var stampDate = new Date(timestamp*1000);
      var faMonth = stampDate.toLocaleDateString('fa-IR', { month: 'long'});
      var faYear = stampDate.toLocaleDateString('fa-IR', { year: 'numeric' });
      var faDate = faMonth +' '+ faYear
      return faDate;
    }
    $(window).scroll(function () {
      if ($(this).scrollTop() < 400) {
        $('#navbar-content').hide();
      } else {
        $('#navbar-content').show();
      }
    });