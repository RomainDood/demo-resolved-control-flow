import {Component, computed, effect, resource, resolved, signal, VERSION} from '@angular/core';

interface User {
  first: string;
  last: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly ngVersion = VERSION.full;
  protected readonly delayMs = signal(800);
  protected readonly requestKey = signal(0);
  private readonly shouldFail = signal(false);
  private readonly query = signal<User | undefined>(undefined);
  protected readonly effectLog = signal<string[]>([]);

  readonly userResource = resource({
    params: () => {
      const query = this.query();
      if (query === undefined) {
        return undefined;
      }
      return {
        key: this.requestKey(),
        fail: this.shouldFail(),
        first: query.first,
        last: query.last,
      };
    },
    loader: async ({params, abortSignal}) => {
      await delay(this.delayMs(), abortSignal);
      if (params.fail) {
        throw new Error('Failed to load user');
      }
      return {first: params.first, last: params.last} satisfies User;
    },
  });

  readonly user = resolved(this.userResource);

  readonly fullName = computed(() => {
    const u = this.user();
    return `${u.first} ${u.last}`;
  });

  readonly greeting = computed(() => `Hello, ${this.fullName()}`);

  readonly detailsResource = resource({
    params: () => this.fullName(),
    loader: async ({params, abortSignal}) => {
      await delay(400, abortSignal);
      return `Details for ${params}`;
    },
  });

  constructor() {
    effect(() => {
      this.effectLog.update((lines) => [`effect: ${this.greeting()}`, ...lines].slice(0, 6));
    });
  }

  protected load(first: string, last: string): void {
    this.shouldFail.set(false);
    this.query.set({first, last});
    this.requestKey.update((key) => key + 1);
  }

  protected fail(): void {
    this.shouldFail.set(true);
    this.query.set({first: 'Ada', last: 'Lovelace'});
    this.requestKey.update((key) => key + 1);
  }

  protected reset(): void {
    this.shouldFail.set(false);
    this.query.set(undefined);
  }

  protected asNumber(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }
}

function delay(ms: number, abortSignal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    abortSignal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(abortSignal.reason);
    });
  });
}
