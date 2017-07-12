export class Post {
  constructor(
    content: string,
    user: { username: string, _id: number },
    likes: [{username: string, _id: number}],
    comments: [{comment: string, username: string, _id: number}],
    link_title: string,
    link_url: string,
    link_img: string,
    time_ago: string,
    img: string,
  ) {}
}
