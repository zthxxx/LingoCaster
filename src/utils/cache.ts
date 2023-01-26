class ListNode {
  key: string
  value: string
  prev: ListNode | null
  next: ListNode | null

  constructor(key: string, value: string) {
    this.key = key
    this.value = value
    this.prev = null
    this.next = null
  }
}

export class LRUCache {
  private capacity: number
  private cache: Map<string, ListNode>
  private head: ListNode | null
  private tail: ListNode | null

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
    this.head = null
    this.tail = null
  }

  static from({ list, capacity }: {
    list: string[];
    capacity: number;
  }): LRUCache {
    const cache = new LRUCache(capacity)
    list.slice().reverse().forEach((item) => cache.put(item))
    return cache
  }

  private moveToHead(node: ListNode): void {
    if (this.head === node) return

    if (node.prev) node.prev.next = node.next
    if (node.next) node.next.prev = node.prev

    if (this.tail === node) this.tail = node.prev

    node.prev = null
    node.next = this.head
    if (this.head) this.head.prev = node
    this.head = node
  }

  get(value: string): string | null {
    const node = this.cache.get(value)
    if (!node) return null

    this.moveToHead(node)
    return node.value
  }

  has(value: string): boolean {
    const node = this.cache.get(value)
    return !!node
  }

  put(value: string): string | undefined {
    const node = this.cache.get(value)

    if (node) {
      node.value = value
      this.moveToHead(node)
    }
    else {
      const newNode = new ListNode(value, value)
      this.cache.set(value, newNode)

      if (!this.head) {
        this.head = newNode
        this.tail = newNode
      }
      else {
        newNode.next = this.head
        this.head.prev = newNode
        this.head = newNode
      }

      if (this.cache.size > this.capacity) {
        if (this.tail) {
          const deleted = this.tail.key
          this.cache.delete(this.tail.key)
          this.tail = this.tail.prev
          if (this.tail) this.tail.next = null
          return deleted
        }
      }
    }
  }

  getList(): string[] {
    const list: string[] = []
    let currentNode = this.head

    while (currentNode) {
      list.push(currentNode.value)
      currentNode = currentNode.next
    }

    return list
  }
}
