export interface IUser {
  id: string;
  username: string;
  name: string;
  password: string;
  registeredAt: Date;
}

export interface ICreateUser {
  username: string;
  name: string;
  password: string;
}

export interface IContent extends ICreateContent {
  id: number;
}

export interface ICreateContentDto {
  videoUrl: string;
  comment: string;
  rating: number;
}

export interface ICreateContent extends ICreateContentDto {
  videoTitle: string;
  thumbnailUrl: string;
  creatorName: string;
  creatorUrl: string;
  userId: string;
}













// export interface IUser {
//   id: string;
//   username: string;
//   name: string;
//   password: string;
//   registeredAt: Date;
// }

// export interface ICreateUser {
//   username: string;
//   name: string;
//   password: string;
// }

// export interface IContent extends ICreateContent {
//   id: number;
// }

// export interface ICreateContentDto {
//   videoUrl: string;
//   comment: string;
//   rating: number;
// }

// export interface ICreateContent extends ICreateContentDto {
//   videoTitle: string;
//   thumbnailUrl: string;
//   creatorName: string;
//   creatorUrl: string;
//   userId: string;
// }

