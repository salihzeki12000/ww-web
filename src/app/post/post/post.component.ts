import { Component, OnInit, Input } from '@angular/core';

import { Post } from '../post';
import { PostService } from '../post.service';

@Component({
  selector: 'ww-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @Input() post: Post;
  editing = false;

  constructor(private postService: PostService) { }

  ngOnInit() {
  }

  onEdit()  {
    this.editing = true;
  }

  updatePost(post: Post, editedPost: string)  {
    editedPost = editedPost.trim();
    this.postService.editPost(post, editedPost)
        .subscribe(
          data => console.log(data)
        )
    this.editing = false;
  }

  onDelete()  {
    this.postService.deletePost(this.post)
        .subscribe(
          data => console.log(data)
        )
  }
}
