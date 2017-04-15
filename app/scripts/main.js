var entryNo = $('#to-do-list li').length;

$('form').on('submit', function(e) {
  e.preventDefault();
  var to_do = $('#to-do-add').val();
  var str = [];
  str.push('<li><input type="checkbox" id="cb');
  entryNo++;
  str.push(entryNo);
  str.push('"><label for="cb');
  str.push(entryNo);
  str.push('">');
  str.push(to_do);
  str.push('</li>');
  $('#to-do-list').append(str.join(''));
  $('#to-do-add').val('');
  return false;
});

// confirm('javascript has been changed!');
