--- 
layout: post
title: "PHP: Wake On LAN (WOL)"
excerpt: Ich habe neben meinem Macbook natürlich auch einen Desktoprechner. Dieser läuft natürlich nicht den ganzen Tag durch, wer sollte auch die Stromkosten dafür aufbringen :). Dennoch wär es hilfreich, wenn ich den Rechner einfach hochfahren könnte - von überall. Die Technik dazu ist nichts Neues und trägt den passenden Namen "[Wake On LAN](https://de.wikipedia.org/wiki/Wake_On_LAN "Wake On LAN - Wikipedia")" (dt. Aufwecken über [LAN](https://de.wikipedia.org/wiki/Local_Area_Network "Local Area Network - Wikipedia")). Ich hab mir also einfach eine Funktion geschrieben, die genau diese Aufgabe in PHP widerspiegelt und erfüllt. Den kompletten Quellcode kann man hier einfach downloaden und direkt benutzen.
---
Ich habe neben meinem Macbook natürlich auch einen Desktoprechner. Dieser läuft natürlich nicht den ganzen Tag durch, wer sollte auch die Stromkosten dafür aufbringen :). Dennoch wär es hilfreich, wenn ich den Rechner einfach hochfahren könnte - von überall. Die Technik dazu ist nichts Neues und trägt den passenden Namen "[Wake On LAN](https://de.wikipedia.org/wiki/Wake_On_LAN "Wake On LAN - Wikipedia")" (dt. Aufwecken über [LAN](https://de.wikipedia.org/wiki/Local_Area_Network "Local Area Network - Wikipedia")). Ich hab mir also einfach eine Funktion geschrieben, die genau diese Aufgabe in PHP widerspiegelt und erfüllt. Den kompletten Quellcode kann man hier einfach downloaden und direkt benutzen.

Hier der vollständige und dokumentierte Code.
```php
<?php
 
/**
 * exception class for failed socket connection
 *
 */
class SocketConnectionException extends Exception { }
 
/**
 * exception class for failed wake on lan request
 *
 */
class WakeOnLANException extends Exception { }
 
/**
 * a function to wake any computer using "Wake on LAN"
 *
 * @link https://en.wikipedia.org/wiki/Wake-on-LAN
 * @author Toni Uebernickel <tuebernickel@whitestarprogramming.de>
 * @copyright https://sam.zoy.org/wtfpl/
 *
 * @version 1.0
 * @todo 1.1 Check for valid (reachable) host.
 * @todo 1.1 Validate the given MAC Address.
 *
 * @example WakeOnLAN('13:37:13:37:13:37', 'host.domain');
 * @example WakeOnLAN('13:37:13:37:13:37', '10.65.0.151', 7);
 *
 * @see https://www.php.net/fsockopen
 * @throws SocketConnectionException if connection could not be established ErrorCode: defined by fsockopen
 * @throws WakeOnLANException if amount of sent bytes is not 102 (needed for WOL) ErrorCode: E_ERROR
 *
 * @param string $macAddress The MAC address to send the WOL package for.
 * @param string $hostAddress The address to which the WOL request will be sent (may be an IP or any hostname).
 * @param int $hostPort The destination port on which the WOL request will be sent.
 *
 * @return bool Returns true if Wake On LAN magic packet was sent successfully.
 */
function WakeOnLAN($macAddress, $hostAddress, $hostPort = 9)
{
  // check for given parameters and exit if either is not given
  if (!$macAddress or !$hostAddress or !intval($hostPort))
  {
    return false;
  }
 
  // add UDP protocol handler prefix
  $hostAddress = 'udp://' . $hostAddress;
 
  /**
   * The data string that will be sent to the destination host.
   */
  $WakeOnLANSequence = null;
 
  /**
   * Error variables set if socket connection fails.
   * Both are passed by reference to fsockopen().
   */
  $errNo = $errMessage = null;
 
  /**
   * Open the socket through which the Wake On LAN data sequence will be sent.
   *
   * Surpressing E_NOTICE || E_WARNING of fsockopen() due to error handling with exceptions.
   */
  if ($socket = @fsockopen($hostAddress, $hostPort, $errNo, $errMessage))
  {
    /**
     * Initialize the first six bytes for the Wake On LAN magic packet.
     *
     * @see https://en.wikipedia.org/wiki/Wake-on-LAN#Magic_Packet
     */
    $WakeOnLANSequence = "\xFF\xFF\xFF\xFF\xFF\xFF";
 
    /**
     * Strip MAC address to an hexidecimal string.
     *
     * @see https://en.wikipedia.org/wiki/MAC_address
     *
     * This call removes all characters but 0 to 9 and A to F (a to f).
     */
    $macAddress = preg_replace('/[^0-9A-Fa-f]/', '', $macAddress);
 
    /**
     * Encode the MAC address into ASCII characters.
     *
     * substr(): get each separated set of the MAC address
     * hexdec(): convert the set to decimal values used by ASCII
     * chr(): convert the decimal value into the ASCII character
     *
     * @see https://en.wikipedia.org/wiki/ASCII
     */
    for ($i = 0; $i < 12; $i += 2)
    {
      $macAddressHex .= chr(hexdec(substr($macAddress, $i, 2)));
    }
 
    /**
     * Complete the magic packet by adding the MAC address 16 times after the initialized six byte sequence.
     *
     * @see https://en.wikipedia.org/wiki/Wake-on-LAN#Magic_Packet
     */
    for ($i = 0; $i < 16; $i++)
    {
      $WakeOnLANSequence .= $macAddressHex;
    }
 
    /**
     * Send the magic packet through the open socket and save the amount of sent bytes.
     *
     * Surpressing E_NOTICE || E_WARNING again due to error handling.
     */
    $bytesSent = @fputs($socket, $WakeOnLANSequence);
 
    /**
     * Finally close the socket and once again surpress any E_NOTICE || E_WARNING.
     */
    if (@fclose($socket) and $bytesSent === 102)
    {
      /**
       * This returns the successful delivery of the Wake On LAN magic packet described below.
       * However, this does not ensure the requested host is now up and running.
       *
       * If the host did not wake up:
       * Check your NAT and any other network configuration between this script server and the destination host.
       * Check the hosts' configuration about Wake On LAN.
       *
       * @see https://en.wikipedia.org/wiki/Wake-on-LAN#Magic_Packet
       */
      return true;
    }
    else
    {
      // The byte sequence is corrupt or was not sent properly.
      throw new WakeOnLANException('Wake On LAN failed, sent ' . $bytesSent . ' out of 102 bytes', E_ERROR);
    }
  }
  else
  {
    // The socket could not be opened.
    throw new SocketConnectionException('Could not open socket to ' . $hostAddress . ' on port ' . $hostPort . '. Error: ' . $errMessage, $errNo);
  }
}
```

Die Verwendung ist recht einfach. Man lädt die Datei z.B. mit include_once() und kann dann die Funktion wie folgt aufrufen.

```php
<?php
include_once('wake_on_lan.php');

try
{
  WakeOnLAN('13:37:13:37:13:37', '192.168.0.10');
}
catch (SocketConnectionException $e)
{
  // socket connection failed
  echo 'The socket connection could not be established.', "\n", $e;
}
catch (WakeOnLANException $e)
{
  // wake on lan request failed
  echo 'The Wake On LAN packet was not sent properly.', "\n", $e;
}
```
