---
title: مجله
layout: home
slug: posts
permalink: /magazine/
image: /assets/images/Paintings/narcissus.jpg
caption: Narcissus / Caravaggio, 1595, Oil on canvas, 110 cm × 92 cm (43 × 36 in), Palazzo Barberini, Rome Italy.
---
<div class="accordion accordion-flush mb-2" id="accordionFlushExample">
{% for category in site.categories %}
{%assign catsize = 0 %}
{%assign catrecent = 0 %}
{% for post in site.posts %}
{% for cat in post.categories %}
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
        {% for post in site.posts %}
        {% if catrecent  == 5 %}{% break %}{% endif %} 
        {% for cat in post.categories %}
        {% if cat.path == category.relative_path %}
        {% assign catrecent = catrecent | plus: 1 %}
        <li class="list-group-item small"><a href="{{post.url}}" class="text-reset">{{post.title}}</a><span class="float-end text-muted persianDate" data-timestamp="{{post.date | date: '%s'}}"></span></li>
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
