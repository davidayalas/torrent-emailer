How to use
===========

From your Google Drive, you can create a Script or a SpreadSheet. Then you have to setup the TV Shows you are watching.

You will receive an email with the torrents of yours TV shows depending on the scheduled time of the script. It will check http://eztv.it for new torrents.

How to set up
--------------

*	Create a SpreadSheet or a Script from your Google Drive

	- If you create a SpreadSheet you have to go to Script Editor menu. Next steps are the same for SpreadSheet or Script. First column of the SpreadSheet has to contain the TV Shows.

	[<img src="https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/spreadsheet-script.png">](https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/spreadsheet-script.png)

*	Copy the code of the [script](https://raw.github.com/davidayalas/gas-torrent-emailer/master/gas-torrent-emailer.js) in your script

* 	Go to **File > Project Properties**, and in the pop up window, select **User properties** and add a list with your TV Shows. The format has to be "tv show sXXeXX" where "s" is the season and "e" the current episode to download. Sample "Dexter s07e01"

	[<img src="https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/project-properties.png">](https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/project-properties.png)

	[<img src="https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/project-properties-2.png">](https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/project-properties-2.png)

*	Schedule a time to execute the search of torrents. Go to **Resources > Current script's triggers** and schedule the "main" function a number of hours: 6 or 12 will be right.

	[<img src="https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/scheduler-1.png">](https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/scheduler-1.png)

	[<img src="https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/scheduler-2.png">](https://raw.github.com/davidayalas/gas-torrent-emailer/master/samples/scheduler-2.png)

*	Enjoy it
