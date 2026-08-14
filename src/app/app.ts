import {Component, computed, effect, resource, signal, VERSION} from '@angular/core';

interface User {
  first: string;
  last: string;
}

/**
 * Conceptual demo for an Angular feature request.
 *
 * Today's public API cannot express `@resolved` / `resolved()`.
 * This app reproduces the *scenario* with `resource()` + status checks,
 * and shows the proposed syntax next to it.
 */
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

  /** Today's workaround: derive only when the resource has a value. */
  readonly fullName = computed(() => {
    const user = this.userResource.hasValue() ? this.userResource.value() : undefined;
    return user ? `${user.first} ${user.last}` : undefined;
  });

  /**
   * Chained resource: waits for the user resource to resolve.
   * Proposed: `params: () => this.fullName()` after `resolved(userResource)`.
   */
  readonly greetingResource = resource({
    params: () => this.fullName(),
    loader: async ({params, abortSignal}) => {
      await delay(400, abortSignal);
      return `Hello, ${params}`;
    },
  });

  readonly proposedSyntax = `user = resolved(this.userResource);
fullName = computed(() => {
  const u = this.user();
  return \`\${u.first} \${u.last}\`;
});

effect(() => {
  console.log(this.fullName()); // runs only when resolved
});

details = resource({
  params: () => this.fullName(),
  loader: ({params}) => fetchDetails(params),
});`;

  readonly proposedTemplate = `@resolved {
  <h2>{{ fullName() }}</h2>
  <p>{{ greeting() }}</p>
} @loading {
  <p>Loading…</p>
} @error {
  <p>Failed to load</p>
}`;

  constructor() {
    effect(() => {
      const name = this.fullName();
      if (name === undefined) {
        return;
      }
      this.effectLog.update((lines) => [`effect: ${name}`, ...lines].slice(0, 6));
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
