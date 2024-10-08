const eventMap = {
  1001: 'book1',
  1002: 'book2',
  1003: 'book3',
}

const getID = value => {
  let key = -1
  for (const id of Object.keys(eventMap)) {
    if (eventMap[id] === value) {
      key = id
      break
    }
  }
  return key
}

// 事件系统中介
class EventBus {
  constructor() {
    this.subscribers = {}
    this.onceSubcribers = {}
  }

  subscribe(eventId, subscriber) {
    if (!this.subscribers[eventId]) {
      this.subscribers[eventId] = []
    }
    this.subscribers[eventId].push(subscriber)
  }

  subscribeOnce(eventId, subscriber) {
    if (!this.onceSubcribers[eventId]) {
      this.onceSubcribers[eventId] = []
    }
    this.onceSubcribers[eventId].push(subscriber)
  }

  cancelSubscribe(eventId, subscriber) {
    console.log(`订阅者${subscriber.name}取消对ID为${eventId}的事件订阅`)
    const index = this.subscribers[eventId].findIndex(item => item === subscriber)
    this.subscribers[eventId].splice(index, 1)
  }

  publish(eventId, data) {
    if (!this.subscribers[eventId] && !this.onceSubcribers[eventId]) return

    if (this.subscribers[eventId]?.length > 0) {
      const eventData = data || {}
      this.subscribers[eventId].forEach(subscriber => subscriber.handle(eventId, eventData))
    }

    if (this.onceSubcribers[eventId]?.length > 0) {
      const eventData = data || {}
      this.onceSubcribers[eventId].forEach(subscriber => subscriber.handle(eventId, eventData))
      this.onceSubcribers[eventId] = []
    }
    
  }
}

// 订阅者
class BookSubscriber {
  constructor(name) {
    this.name = name
    this.books = []
  }

  subscribe(eventBus, eventId, type) {
    switch(type) {
      case 'once':
        eventBus.subscribeOnce(eventId, this)
        return
      case 'normal':
        eventBus.subscribe(eventId, this)
        return
      default:
        eventBus.subscribe(eventId, this)
        return
    }
    
  }

  cancel(eventBus, eventId) {
    eventBus.cancelSubscribe(eventId, this)
  }

  handle(eventId, data) {
    console.log(`订阅者${this.name}接收到ID为${eventId}的事件发布通知`)
    this.addBook(data.bookname)

  }

  addBook(book) {
    this.books.push(book)
    console.log(`${this.name}现在的书库为`)
    console.log(this.books)
  }
}

// 发布者
class BookPublisher {
  constructor(name) {
    this.name = name
  }

  restock(eventBus, name) {
    const data = {
      bookname: name
    }
    eventBus.publish(getID(name), data)
  }
}

const eventBus = new EventBus()

const xiaoming = new BookSubscriber('xiaoming')
xiaoming.subscribe(eventBus, 1001)
xiaoming.subscribe(eventBus, 1002)

const xiaoluo = new BookSubscriber('xiaoluo')
xiaoluo.subscribe(eventBus, 1001, 'once')
xiaoluo.subscribe(eventBus, 1002)
xiaoluo.subscribe(eventBus, 1003)

const bookStore1 = new BookPublisher('bookStore1')
const bookStore2 = new BookPublisher('bookStore2')
bookStore1.restock(eventBus, 'book1')
bookStore1.restock(eventBus, 'book2')
xiaoming.cancel(eventBus, 1002)
bookStore2.restock(eventBus, 'book3')
bookStore1.restock(eventBus, 'book1')
bookStore1.restock(eventBus, 'book2')



