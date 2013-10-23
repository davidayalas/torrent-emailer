Torrent emailer
================

From your Google Drive, you can create a Script or a SpreadSheet. Then you have to setup the TV Shows you are watching.

You will receive an email with the torrents of yours TV shows depending on the scheduled time of the script. It will check http://eztv.it for new torrents. You have to ensure the TV show is exactly the same in your properties than in eztv.it. E.g.:

* if you are looking for "Agents of S.H.I.E.L.D" you must look first at eztv.it and you will get the show is named "Marvels Agents of S H I E L D". This is the name you have to setup: "Marvels Agents of S H I E L D s01e01" (case insensitive)

How to set up
--------------

*	Create a SpreadSheet or a Script from your Google Drive

	- If you create a SpreadSheet you have to go to Script Editor menu. Next steps are the same for SpreadSheet or Script. 

	[<img src="https://raw.github.com/davidayalas/torrent-emailer/master/samples/spreadsheet-script.png">](https://raw.github.com/davidayalas/torrent-emailer/master/samples/spreadsheet-script.png)

	In this case you can also execute manually the script in the SpreadSheet menu Torrent > Get

*	Copy the code of the [script](https://raw.github.com/davidayalas/torrent-emailer/master/gas-torrent-emailer.js) in your script

* 	If you will use only the script, go to **File > Project Properties**, and in the pop up window, select **Project properties** and add a list with your TV Shows. If you will use a SpreadSheet to manage your TV Shows, first column of the SpreadSheet has to contain the them. The format has to be "tv show sXXeXX" where "s" is the season and "e" the current episode to download. Sample "Dexter s07e01"

	[<img src="https://raw.github.com/davidayalas/torrent-emailer/master/samples/project-properties.png">](https://raw.github.com/davidayalas/torrent-emailer/master/samples/project-properties.png)

	[<img src="https://raw.github.com/davidayalas/torrent-emailer/master/samples/project-properties-2.png">](https://raw.github.com/davidayalas/torrent-emailer/master/samples/project-properties-2.png)

*	Schedule a time to execute the search of torrents. Go to **Resources > Current script's triggers** and schedule the "main" function a number of hours: 6 or 12 hours or once a week will be right.

	[<img src="https://raw.github.com/davidayalas/torrent-emailer/master/samples/scheduler-1.png">](https://raw.github.com/davidayalas/torrent-emailer/master/samples/scheduler-1.png)

	[<img src="https://raw.github.com/davidayalas/torrent-emailer/master/samples/scheduler-2.png">](https://raw.github.com/davidayalas/torrent-emailer/master/samples/scheduler-2.png)

*   Run an execution of "main" function. It will request to you to allow the script to execute.

	[<img src="https://raw.github.com/davidayalas/torrent-emailer/master/samples/run.png">](https://raw.github.com/davidayalas/torrent-emailer/master/samples/run.png)

*	Enjoy it
