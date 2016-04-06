
export class ChatMessage {
  constructor(public message: string) { }
}

export class WhosHere {
  users: User[] = [];
  total_users: number = 0;
  server_start_ts: number = 1366577487063;
}
