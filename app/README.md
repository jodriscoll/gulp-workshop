Notable community packages
--------------

### `emmet`
`#page>div.logo+ul#nav>li*5>a{Item $}` results in:
```html
<div id="page">
  <div class="logo"></div>
  <ul id="nav">
    <li><a href="">Item 1</a></li>
    <li><a href="">Item 2</a></li>
    <li><a href="">Item 3</a></li>
    <li><a href="">Item 4</a></li>
    <li><a href="">Item 5</a></li>
  </ul>
</div>
```

### `atom--bootstrap3`
`btngrvr` then `Enter` results in:
```html
<div class="btn-group-vertical" role="group" aria-label="Basic example">
  <button type="button" class="btn btn-secondary">Left</button>
  <button type="button" class="btn btn-secondary">Middle</button>
  <button type="button" class="btn btn-secondary">Right</button>
</div>
```
