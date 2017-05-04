export class Post {
  constructor(
    content: string,
    user: { username: string, userId: number },
    likes: [{username: string, userId: number}],
    comments: [{comment: string, username: string, userId: number}],
    link_title: string,
    link_url: string,
    link_img: string,
  ) {}
}
