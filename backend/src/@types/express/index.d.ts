type UserDetails = {
  id: string;
  name: string;
  email?: string;
  photo_path?: string;
};
declare namespace Express {
  interface Request {
    user?: UserDetails;
  }
}
