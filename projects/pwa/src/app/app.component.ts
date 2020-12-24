import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private httpClient: HttpClient) { }
  show_list: any;
  EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;
  ngOnInit(): void {
    this.httpClient.get('./tv-watchlist-2020-12-23.json').subscribe((json: any) => {
      this.show_list = json.show_list.filter((o:any) => this.GetShowStatus(o)===0);
      console.log('json',json);
    });
  }

  GetShowStatus(show: any) {
		if ((show.status||'').match(this.EndedRegex)) {
			return -1; //Completed
		}
		var episode = show.next_episode || show.last_episode;

		//console.log(show, episode);
		var now = new Date().getTime();
		if (!!episode && !!episode.local_showtime && episode.local_showtime > now )
			return 0; //Running
		else
			return 1; //TBA
	}
}
