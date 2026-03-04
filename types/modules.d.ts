declare module "nodemailer" {
  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user: string; pass: string };
  }
  interface SentMessageInfo {
    messageId?: string;
  }
  interface Transporter {
    sendMail(options: {
      from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
    }): Promise<SentMessageInfo>;
  }
  function createTransport(options: TransportOptions): Transporter;
}

declare module "pg" {
  export class Pool {
    constructor(config?: { connectionString?: string });
    query<R = unknown>(text: string, values?: unknown[]): Promise<QueryResult<R>>;
    end(): Promise<void>;
  }
  export interface QueryResult<R = unknown> {
    rows: R[];
    rowCount: number | null;
    command: string;
    fields: unknown[];
  }
  const pg: { Pool: typeof Pool; default: { Pool: typeof Pool } };
  export default pg;
}
