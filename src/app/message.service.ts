import { Injectable } from '@angular/core';

@Injectable()
export class MessageService {
  messages: string;

  add(message: string) {
    this.clear();
    this.messages = message;
  }

  get() {
    return this.messages;
  }

  clear() {
    this.messages = null;
  }
}
