import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params }    from '@angular/router';

import { PostService }    from '../post.service';
import { LoadingService } from '../../loading';

@Component({
  selector: 'ww-post-display',
  templateUrl: './post-display.component.html',
  styleUrls: ['./post-display.component.scss']
})
export class PostDisplayComponent implements OnInit, OnDestroy {
  post;

  constructor(
    private loadingService: LoadingService,
    private postService: PostService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.postService.getPost(id).subscribe(
        result => {
          this.timeAgo(result.post)
        }
      )
    })

    this.loadingService.setLoader(false, "");

  }

  ngOnDestroy() {
    this.loadingService.setLoader(true, "");
  }

  timeAgo(post) {
    let units = [
      { name: "minute", in_seconds: 60, limit: 3600 },
      { name: "hour", in_seconds: 3600, limit: 86400 },
      { name: "day", in_seconds: 86400, limit: 604800 }
    ];

    let timePosted = new Date(post['created_at']).getTime();
    let timeDiff = (Date.now() - timePosted) / 1000;

    if(timeDiff < 60) {
      post['time_ago'] = "Less than a minute ago"
    } else if(timeDiff > 604800) {
      post['time_ago'] = '';
    } else {
      for (let i = 0; i < units.length; i++) {
        if(timeDiff < units[i]['limit'])  {
          let timeAgo =  Math.floor(timeDiff / units[i].in_seconds);
          post['time_ago'] = timeAgo + " " + units[i].name + (timeAgo > 1 ? "s" : "") + " ago";
          i = units.length;
        };
      }
    }

    for (let j = 0; j < post['comments'].length; j++) {
      let comment = post['comments'][j];
      let commentTimePosted = new Date(comment['created_at']).getTime();
      let commentTimeDiff = (Date.now() - commentTimePosted) / 1000;

      if(commentTimeDiff < 60)  {
        comment['time_ago'] = "Less than a minute ago"
      } else if(commentTimeDiff > 604800) {
        comment['time_ago'] = '';
      } else  {
        for (let k = 0; k < units.length; k++) {
          if(commentTimeDiff < units[k]['limit']) {
            let commentTimeAgo = Math.floor(commentTimeDiff / units[k].in_seconds);
            comment['time_ago'] = commentTimeAgo + " " + units[k].name + (commentTimeAgo > 1 ? "s" : "") + " ago";
            k = units.length;
          }
        }
      }
    }

    this.post = post;
  }
}
