{% if page.slug == 'courses' %}
$.ajax({
  url:"/courses.json",
  dataType: 'json',
  async: false,
  success: function(data) {
    contents = data;

  }
});
{% elsif page.slug == 'posts' %}
$.ajax({
  url:"/posts.json",
  dataType: 'json',
  async: false,
  success: function(data) {
    contents = data;

  }
});
{% endif %}

var no =10;
var to = 10;
var catPosts, filteredCats,searchTxt;
var $grid = $('.grid').masonry({
  originLeft: false,
  columnWidth: ".grid-sizer",
  itemSelector: ".grid-item",
  percentPosition: true
});

displayPost(contents);
$('#loadMore').on('click', function () {
to += no;
displayPost(contents);
})
function displayPost(post) {
if (post.length > to ) {
  $('#loadMore').show();
} else {
  $('#loadMore').hide();
}
for (var i = to-no ; i < to; i++) {
  if (i< post.length) {
    var taglist = '';
    var authorlist = '';
    var coverImg = '';
    var excerpt = '';
    var $postCard = '';
    for (var j = 0; j < post[i].tags.length; j++) {
      var tagitem= `<a href="${post[i].tags[j].url}" class="btn btn-light rounded-pill me-1 mb-1"><i class="bi bi-hash"></i>${post[i].tags[j].title}</a>`;
      taglist += tagitem;
    }
    if (post[i].coverImg) {
      coverImg = `<a href="${post[i].link}"><img src="${post[i].coverImg}" class="card-img-top" alt="${post[i].title}"></a>`;
      excerpt = ''
    } else {
      coverImg = '';
      excerpt = '<p class="m-0">'+post[i].excerpt+'</p>';
    }
    for (var j = 0; j < post[i].authors.length; j++) {
      var authoritem= `<a class="text-reset" href="${post[i].authors[j].url}">${post[i].authors[j].avatar? `<img src="//images.weserv.nl/?url=https://phicudemy.github.io${post[i].authors[j].avatar}&w=20&h=20&fit=cover&mask=circle" class="float-start me-2">`: `` }${post[i].authors[j].title}</a> `;
      authorlist += authoritem;
    }
    {% if page.slug == 'courses' %}
    var postCard = `
    <div class="grid-item ${post[i].featured? 'grid-item--width2': ''} ${post[i].category[0].slug} px-2 pb-4 mb-2">
            {% include cardCourse.html%}
    </div>
    `;
    {% elsif page.slug == 'posts' %}
    var postCard = `
    <div class="grid-item ${post[i].featured? 'grid-item--width2': ''} ${post[i].category[0].slug} px-2 pb-4 mb-2">
      {% include cardContent.html%}
    </div>
    `;
    {% endif %}

    $postCard = $(postCard)
    $grid.append($postCard).masonry( 'appended', $postCard );
  }
}
}

function filterPost() {
$('html, body').animate({ scrollTop: 0 }, 120);
to = no;
var selectedPosts = contents;
filteredCats = [];
if (searchTxt) {
  selectedPosts = selectedPosts.filter(function(el) {
     return el.search.includes(searchTxt)
  } );
}
  filteredCats = $('input[name=category]').filter(":checked").map(function(){return this.value;}).get();
  if (filteredCats.length > 0) {
    selectedPosts = selectedPosts.filter(i => i.category.some(g=> filteredCats.includes(g.slug)))
  }
  filteredTags = $('input[name=tag]').filter(":checked").map(function(){return this.value;}).get();
  if (filteredTags.length > 0) {
    selectedPosts = selectedPosts.filter(i => i.tags.some(g=> filteredTags.includes(g.slug)))
  }
  $grid.masonry( 'remove', $grid.find('.grid-item') ).masonry('layout');
  window.scrollTo({top: 0, behavior: 'smooth'});
  displayPost(selectedPosts)
}
$('#clearBtn').on('click', function functionName() {
$('#searchForm').trigger('reset');
$('#searchBtn').show();
$('#clearBtn').hide();
searchTxt = null;
filterPost()

})
$('#searchForm').submit(function (e) {
e.preventDefault();
$('#searchBtn').hide();
$('#clearBtn').show();
searchTxt = $('#searchTxt').val();
filterPost()
})
$('input[type=checkbox]').on('change', function () {
filterPost()
})

