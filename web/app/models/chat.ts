import {User} from './user';

export class ChatMessage {
  constructor(
    public message: any,
    public is_system: boolean) {}
}

export class WhosHere {
  users: User[] = [];
  total_users: number = 0;
  server_start_ts: number = 1366577487063;

  add_user(user: User) {
    for (let u of this.users) {
      if (u.id == user.id) {
        return;
      }
    }
    this.users.push(user);
  }

  remove_user(user: User) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id == user.id) {
        if (i + 1 < this.users.length) {
          this.users[i] = this.users[this.users.length - 1];
        }
        this.users.pop();
        break;
      }
    }
  }
}
