import { expect } from '@esm-bundle/chai';
import { MessageList } from '../src';

describe('MessageList', () => {
  it('should be instantiated with correct default values', () => {
    const messageList = new MessageList<number>();
    
    expect(messageList.messageCount).to.equal(0);
    expect(messageList.message).to.equal('');
  });

  describe('add', () => {
    it('should add a single message correctly', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading', 1);

      expect(messageList.message).to.equal('Loading...');
    });

    it('should add a single message without ellipsis', () => {
      const messageList = new MessageList<number>(false);
      messageList.add('Loading', 1);

      expect(messageList.message).to.equal('Loading');
    });

    it('should preserve ellipsis with auto ellipsis turned off', () => {
      const messageList = new MessageList<number>(false);
      messageList.add('Loading...', 1);
      messageList.add('Loading something else...', 2);

      expect(messageList.message).to.equal('Loading..., Loading something else...');
    });

    it('should add multiple messages with ellipsis', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading', 1);
      messageList.add('Doing something awesome', 2);

      expect(messageList.message).to.equal('Loading, Doing something awesome...');
    });

    it('should add multiple messages without ellipsis', () => {
      const messageList = new MessageList<number>(false);
      messageList.add('Loading', 1);
      messageList.add('Doing something awesome', 2);

      expect(messageList.message).to.equal('Loading, Doing something awesome');
    });

    it('should add multiple messages with ellipsis and remove existing ellipsis messages', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading...', 1);
      messageList.add('Doing something awesome...', 2);

      expect(messageList.message).to.equal('Loading, Doing something awesome...');
    });
  });

  describe('remove', () => {
    it('should remove a message correctly', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading', 1);
      messageList.remove(1);

      expect(messageList.message).to.equal('');
      expect(messageList.messageCount).to.equal(0);
    });

    it('should remove a message and leave existing messages', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading', 1);
      messageList.add('Something else', 2);
      messageList.add('Something awesome', 3);
      messageList.remove(2);

      expect(messageList.message).to.equal('Loading, Something awesome...');
      expect(messageList.messageCount).to.equal(2);
    });
  });

  describe('reset', () => {
    it('should reset to default state', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading', 1);
      messageList.add('Something else', 2);
      messageList.reset();

      expect(messageList.messageCount).to.equal(0);
      expect(messageList.message).to.equal('');
    });
  });

  describe('update', () => {
    it('should update a single message', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading', 1);
      messageList.add('Something else', 2);
      messageList.update('Loading new', 1);

      expect(messageList.message).to.equal('Loading new, Something else...');
    });

    it('should update a single message and preserve auto ellipsis', () => {
      const messageList = new MessageList<number>();
      messageList.add('Loading', 1);
      messageList.add('Something else', 2);
      messageList.update('Something else new', 2);

      expect(messageList.message).to.equal('Loading, Something else new...');
    });
  });

  describe('hasMessage', () => {
    it('should return true if a message exists with the provided identifier', () => {
      const messageList = new MessageList<number>();
      messageList.add('Doing something', 1);
      expect(messageList.hasMessage(1)).to.be.true;
    });

    it('should return false if a message doesn\'t exist with the provided identifier', () => {
      const messageList = new MessageList<number>();
      messageList.add('Doing something', 1);
      expect(messageList.hasMessage(2)).to.be.false;
    });
  });

  describe('useAutoEllipsis', () => {
    it('should update message properly with original values when turning off auto ellipsis', () => {
      const messageList = new MessageList<number>();
      messageList.add('Message 1', 1);
      messageList.add('Message 2', 2);

      expect(messageList.message).to.equal('Message 1, Message 2...');

      messageList.useAutoEllipsis = false;

      expect(messageList.message).to.equal('Message 1, Message 2');
    });

    it('should restore ellipsis when toggling auto ellipsis', () => {
      const messageList = new MessageList<number>(false);
      messageList.add('Message 1', 1);
      messageList.add('Message 2', 2);

      expect(messageList.message).to.equal('Message 1, Message 2');

      messageList.useAutoEllipsis = true;

      expect(messageList.message).to.equal('Message 1, Message 2...');
    });
  });
});
