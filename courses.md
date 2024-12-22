---
title: آکادمی
layout: home
slug: courses
permalink: /academy/
image: /assets/images/Paintings/plato_academy_mosaic.jpg
caption: Plato's Academy mosaic (from Pompeii), 100 BC to 79 AD, 86 cm × 85 cm (34 × 33 in), National Archaeological Museum of Naples, Naples, Italy.
---
<div class="accordion accordion-flush mb-2" id="accordionFlushExample">
{% for category in site.contents %}
{%assign catsize = 0 %}
{%assign catrecent = 0 %}
{% for post in site.events %}
{% for cat in post.contents %}
{% if cat.path == category.relative_path %}{%assign catsize = catsize | plus: 1 %}{%endif%}
{%endfor%}
{%endfor%}
{%if catsize >0 %}
<div class="accordion-item">
    <h2 class="accordion-header">
    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse-{{category.slug}}" aria-expanded="false" aria-controls="flush-collapseOne">
        {{category.title}}
    </button>
    </h2>
    <div id="flush-collapse-{{category.slug}}" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
    <div class="accordion-body">
        <ul class="list-group list-group-flush">
        {% assign siteevents = site.events | sort: 'post_date' | reverse%}
        {% for post in siteevents %}
        {% if catrecent  == 5 %}{% break %}{% endif %} 
        {% for cat in post.contents %}
        {% if cat.path == category.relative_path %}
        {% assign catrecent = catrecent | plus: 1 %}
        <li class="list-group-item small"><a href="{{post.url}}" class="text-reset">{{post.title}}</a><span class="float-end text-muted persianMonth" data-timestamp="{{post.start | date: '%s'}}"></span></li>
        {%endif%}
        {%endfor%}
        {%endfor%}
        </ul>
        <a href="{{category.url}}" class="float-end small text-danger strong mt-2">صفحه {{category.title}} <i class="bi bi-caret-left-fill"></i></a><br>
    </div>
    </div>
</div>
{%endif%}
{%endfor%}
</div>