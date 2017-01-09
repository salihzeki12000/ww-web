import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { PostsComponent } from './posts.component';
import { PostComponent } from './post/post.component';
import { PostInputComponent } from './post-input/post-input.component';
import { PostListComponent } from './post-list/post-list.component';

@NgModule({
  declarations: [
    PostComponent,
    PostsComponent,
    PostInputComponent,
    PostListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
  ],
  // schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PostModule {}
