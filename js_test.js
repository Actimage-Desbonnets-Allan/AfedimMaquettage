function TryIt2(me) {
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));
    alert(dir);
}

function printDiv(me) {
    let mywindow = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
    mywindow.document.write("<html>      <head>        <title>${title}</title>");
    mywindow.document.write('      </head>      <body >        ');
    //mywindow.document.write(me.getElementById(divId).innerHTML);
    mywindow.document.write('      </body>    </html>');
    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/
    mywindow.print();
    mywindow.close();
    return true;
}