--- 
layout: post
title: "Tutorial: Fenster an Hilfslinien ausrichten"
excerpt: Wer kennt es nicht? In heutigen Anwendungen wird es dem Benutzer immer einfacher gemacht, Ordnung zu halten. Einen kleinen aber feinen Beitrag leisten sogenannte Hilfslinien. Anwendungen, die mit mehreren Objekten arbeiten, nutzen diese Hilfslinien unter Anderem auch, um die Objekte zueinander auszurichten. Ich hab heute für [das AzSMRC webUI](http://azsmrc.sourceforge.net/ "AzSMRC Home") genau dies in Javascript implementiert.
---
Wer kennt es nicht? In heutigen Anwendungen wird es dem Benutzer immer einfacher gemacht, Ordnung zu halten. Einen kleinen aber feinen Beitrag leisten sogenannte Hilfslinien. Anwendungen, die mit mehreren Objekten arbeiten, nutzen diese Hilfslinien unter Anderem auch, um die Objekte zueinander auszurichten. Ich hab heute für [das AzSMRC webUI](http://azsmrc.sourceforge.net/ "AzSMRC Home") genau dies in Javascript implementiert.

Das AzSMRC webUI arbeitet mit mehreren Fenstern, die freibeweglich sind. Ich hatte vor ein paar Tagen mal wieder eine dieser Anwendungen gesehen, in denen Hilfslinien zur Ausrichtung der Objekte (in diesem Fall die Fenster) genutzt werden. Da dachte ich mir, dies auch für das AzSMRC webUI zu implementieren.

## Verst&#228;ndnis

Was im Grunde gemacht werden soll, ist Folgendes. Es gibt mehrere Fenster, die eine bestimmte Position auf dem Bildschirm haben und eine bestimmte Höhe und Breite. Sie sind rechteckig, haben also vier Kanten. Ein weiteres Fenster soll sich nun _an einer gedachten Hilfslinie ausrichten_. So soll zum Beispiel Fenster A auf der selben Höhe sein wie Fenster B, wenn ich Fenster A auf dem Bildschirm bewege.

<object class="youtube" height="344" width="425"><param name="movie" value="http://www.youtube.com/v/pjDqZVTtzrI&hl=de&fs=1" /><param name="allowFullScreen" value="true" /><param name="allowscriptaccess" value="always" /><embed allowfullscreen="true" src="http://www.youtube.com/v/pjDqZVTtzrI&hl=de&fs=1" allowscriptaccess="always" type="application/x-shockwave-flash" height="344" width="425"></embed></object>

## Hilfslinien zur Ausrichtung bestimmen

[Das AzSMRC webUI](http://azsmrc.sourceforge.net/ "AzSMRC Home") speichert die x- und y-Koordinaten jedes offenen Fensters in einer Liste. Jeder Listeneintrag repräsentiert ein Fenster und ist selber wiederum eine Liste von vier Koordinaten. Wird ein Fenster geschlossen, so wird der entsprechende Eintrag entfernt.

<dl>
  <dt>x1</dt><dd>linke Kante</dd>
  <dt>y1</dt><dd>obere Kante</dd>
  <dt>x2</dt><dd>rechte Kante</dd>
  <dt>y2</dt><dd>untere Kante</dd>
</dl>

Diese Liste sieht dann also in etwa so aus.

```javascript
snapLines = [ [34, 23, 234, 323], [46, 46, 246, 346] ];
```

Diese Liste entspricht zwei Fenstern, die beide 200x300 Pixel groß sind. Das eine liegt auf der Position (links-oben) 34;23 und das andere Fenster auf Position 46;46.

Wenn man nun ein Fenster bewegt, sollte es während der Bewegung wissen, wo es Hilfslinien gibt. Gegeben sind alle Kanten aller offenen Fenster und die Kanten des Fensters, welches man bewegt. Man kann dieses Problem ziemlich kompliziert lösen, indem man sich für jede Kante des bewegenden Fenster merkt, wo es relevante Hilfslinien (Kanten anderer Fenster) gibt. Es gibt aber auch eine durchaus einfachere Methode, die vorallem schneller ist. Man entscheidet sich für zwei Kanten - eine horizontale und eine vertikale - und richtet das Fenster nur an diesen aus. Damit das klappt, muss man jedoch alle bekannten Kanten entsprechen bereitstellen.

Ich habe mich der Einfachheit halber, da in einem Webdokument Elemente von links-oben ausgerichtet werden, entschieden eben genau diese Kanten zu nehmen: links und oben. Damit habe ich eine vertikale Kante und eine horizontale, an denen man ausrichten kann.

Als erstes hole ich die aktuelle Position des bewegenden Fensters.

```javascript
currentPosition = getSnapLinesByObject( drag_object );
```

Danach erzeuge ich mir zwei Listen für die verfügbaren Hilfslinien (horizontal und vertikal).

```javascript
// these rules are virtual
// not all are really present (explained below)
rules = [];
// vertical rules
rules[ 0 ] = [];
// horizontal rules
rules[ 1 ] = [];
```

Danach geht man einfach jedes bekannte Fenster durch und fügt die entsprechenden Kanten hinzu.

```javascript
// in order to check only for left and top position (rules)
// a virtual rule is created
// which is the right edge of a window set depending on the left edge of the dragged window
// defined by the width of the dragged window

// x1 coordinate of any tab
rules[ 0 ].push( snapLines[ i ][ 0 ] );
```

### "virtuelle Kanten" bestimmen

Da ich das Fenster nur an einer Kante ausrichten möchte (links), das Fenster aber zwei Kanten real hat (links & rechts), muss man die rechte Kannte berücksichtigen und eine entsprechende "virtuelle Kante" erzeugen. Diese Kante wird ganz einfach bestimmt.

Die rechte Kante ist von der linken Kante genau soweit entfernt, wie das Fenster breit ist. Im Umkehrschluß bedeutet das für die linke Kante, an der ich ausrichte, dass es eine weitere "virtuell Kante" gibt. Die Kante bezeichne ich als "virtuell", da sie real nicht existiert. Wenn ich also die rechte Kante auch ausrichten möchte, muss ich für die linke Kante eben genau die Breite vom Fenster weiter links diese virtuelle Kante ablegen. Dadurch richtet sich das zu bewegende Fenster eben auch - augenscheinlich - an seiner rechten Kante aus. Das Prinzip wird natürlich auch für die vertikalen Kanten angewandt.

```javascript
// virtual x1 coordinate
rules[ 0 ].push( snapLines[ i ][ 0 ] - drag_object.offsetWidth );
```

## Fenster an Hilfslinien ausrichten

Sobald man also alle Kanten gesammelt hat, kann das Fenster ausgerichtet werden. Dieser Teil ist recht einfach. Ich geh einfach alle gesammelten Kanten durch, und schaue nach, wie weit die linke Kante des bewegenden Fensters von jeder Hilfslinie entfernt ist - egal ob von links oder rechts (Zeile 132-140). Wenn die Hilfslinie in greifbare Nähe ist, wird das Fenster auf diese Hilfslinie positioniert.

```javascript
// check for vertical snap
for ( var snapLine in rules[ 0 ] )
{
  // snapLine is an x value of a guide line (vertical rule)
  snapLine = rules[ 0 ][ snapLine ];

  // define distance from current guide line
  if ( snapLine > currentPosition[ 0 ] )
  {
    distance = snapLine - currentPosition[ 0 ];
  }
  else
  {
    distance = currentPosition[ 0 ] - snapLine;
  }

  // check for snap range
  if ( distance <= snapDistance )
  {
    drag_object.style.left = snapLine + "px";
  }
}
```

Ich hoffe, ich konnte helfen :) Der komplette Quellcode in einem Stück liegt auf der nächsten Seite und kann dort direkt heruntergeladen werden.

## Code

```javascript
// only try to snap, if there are more than this tab
if ( snapLinesCount > 1 )
{
  // calculate rules
  currentPosition = getSnapLinesByObject( drag_object );
  ownId = drag_object.getAttribute( "tab" );

  // these rules are virtual
  // not all are really present (explained below)
  rules = [];
  // vertical rules
  rules[ 0 ] = [];
  // horizontal rules
  rules[ 1 ] = [];
  for ( var i in snapLines )
  {
    // current window don't need to set up rules
    // it won't be here anymore when dragged
    if ( i != ownId && snapLines[ i ] != null )
    {
      // in order to check only for left and top position (rules)
      // a virtual rule is created
      // which is the right edge of a window set depending on the left edge of the dragged window
      // defined by the width of the dragged window

      // x1 coordinate of any tab
      rules[ 0 ].push( snapLines[ i ][ 0 ] );
      // virtual x1 coordinate
      rules[ 0 ].push( snapLines[ i ][ 0 ] - drag_object.offsetWidth );
      // x2 coordinate of any tab
      rules[ 0 ].push( snapLines[ i ][ 2 ] );
      // virtual x2 coordinate
      rules[ 0 ].push( snapLines[ i ][ 2 ] - drag_object.offsetWidth );

      // same goes for horizontal line with bottom
      // y1 coordinate of any tab
      rules[ 1 ].push( snapLines[ i ][ 1 ] );
      // virtual y2 coordinate
      rules[ 1 ].push( snapLines[ i ][ 1 ] - drag_object.offsetHeight );
      // y2 coordinate of any tab
      rules[ 1 ].push( snapLines[ i ][ 3 ] );
      // virtual y2 coordinate
      rules[ 1 ].push( snapLines[ i ][ 3 ] - drag_object.offsetHeight );
    }
  }

  // check for vertical snap
  for ( var snapLine in rules[ 0 ] )
  {
    // snapLine is an x value of a guide line (vertical rule)
    snapLine = rules[ 0 ][ snapLine ];

    // define distance from current guide line
    if ( snapLine > currentPosition[ 0 ] )
    {
      distance = snapLine - currentPosition[ 0 ];
    }
    else
    {
      distance = currentPosition[ 0 ] - snapLine;
    }

    // check for snap range
    if ( distance <= snapDistance )
    {
      drag_object.style.left = snapLine + "px";
    }
  }

  // check for horizontal snap
  for ( var snapLine in rules[ 1 ] )
  {
    // snapLine is an x value of a guide line (vertical rule)
    snapLine = rules[ 1 ][ snapLine ];

    // define distance from current guide line
    if ( snapLine > currentPosition[ 1 ] )
    {
      distance = snapLine - currentPosition[ 1 ];
    }
    else
    {
      distance = currentPosition[ 1 ] - snapLine;
    }

    // check for snap range
    if ( distance <= snapDistance )
    {
      drag_object.style.top = snapLine + "px";
    }
  }
}
```
