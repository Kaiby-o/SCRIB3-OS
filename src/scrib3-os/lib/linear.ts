// ===== Linear API Client =====
// Uses Linear's GraphQL API to fetch and mutate issues
// API key from VITE_LINEAR_API_KEY environment variable

const LINEAR_API = 'https://api.linear.app/graphql';
const API_KEY = import.meta.env.VITE_LINEAR_API_KEY as string;

async function linearQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Linear API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`Linear GraphQL error: ${json.errors[0]?.message}`);
  }

  return json.data as T;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LinearUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
}

export interface LinearProject {
  id: string;
  name: string;
  icon: string | null;
  color: string;
}

export interface LinearState {
  id: string;
  name: string;
  color: string;
  type: string; // backlog, unstarted, started, completed, cancelled
  position: number;
}

export interface LinearComment {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string; avatarUrl: string | null } | null;
}

export interface LinearIssue {
  id: string;
  identifier: string;     // e.g. "SUP-158"
  title: string;
  description: string | null;
  priority: number;        // 0=none, 1=urgent, 2=high, 3=medium, 4=low
  state: LinearState;
  assignee: LinearUser | null;
  labels: { nodes: LinearLabel[] };
  project: LinearProject | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  subIssueSortOrder: number;
  children: { nodes: LinearIssue[] };
  comments: { nodes: LinearComment[] };
  url: string;
}

export const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'No Priority', color: '#95A5A6' },
  1: { label: 'Urgent', color: '#E74C3C' },
  2: { label: 'High', color: '#E67E22' },
  3: { label: 'Medium', color: '#F1C40F' },
  4: { label: 'Low', color: '#6E93C3' },
};

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

const ISSUES_QUERY = `
  query Issues($first: Int, $filter: IssueFilter) {
    issues(first: $first, filter: $filter, orderBy: updatedAt) {
      nodes {
        id
        identifier
        title
        description
        priority
        dueDate
        createdAt
        updatedAt
        completedAt
        url
        state {
          id name color type position
        }
        assignee {
          id name email avatarUrl
        }
        labels {
          nodes { id name color }
        }
        project {
          id name icon color
        }
        children {
          nodes {
            id identifier title
            state { id name color type }
            assignee { id name avatarUrl }
          }
        }
      }
    }
  }
`;

const ISSUE_DETAIL_QUERY = `
  query Issue($id: String!) {
    issue(id: $id) {
      id identifier title description priority dueDate createdAt updatedAt completedAt url
      state { id name color type position }
      assignee { id name email avatarUrl }
      labels { nodes { id name color } }
      project { id name icon color }
      children {
        nodes {
          id identifier title
          state { id name color type }
          assignee { id name avatarUrl }
        }
      }
      comments(orderBy: createdAt) {
        nodes {
          id body createdAt
          user { name avatarUrl }
        }
      }
    }
  }
`;

const TEAM_STATES_QUERY = `
  query {
    workflowStates(first: 50) {
      nodes {
        id name color type position
      }
    }
  }
`;

const TEAM_MEMBERS_QUERY = `
  query {
    users(first: 100) {
      nodes {
        id name email avatarUrl
      }
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  API Functions                                                      */
/* ------------------------------------------------------------------ */

export async function fetchIssues(first: number = 100): Promise<LinearIssue[]> {
  const data = await linearQuery<{ issues: { nodes: LinearIssue[] } }>(ISSUES_QUERY, { first });
  return data.issues.nodes;
}

export async function fetchIssueDetail(id: string): Promise<LinearIssue> {
  const data = await linearQuery<{ issue: LinearIssue }>(ISSUE_DETAIL_QUERY, { id });
  return data.issue;
}

export async function fetchWorkflowStates(): Promise<LinearState[]> {
  const data = await linearQuery<{ workflowStates: { nodes: LinearState[] } }>(TEAM_STATES_QUERY);
  return data.workflowStates.nodes.sort((a, b) => a.position - b.position);
}

export async function fetchLinearUsers(): Promise<LinearUser[]> {
  const data = await linearQuery<{ users: { nodes: LinearUser[] } }>(TEAM_MEMBERS_QUERY);
  return data.users.nodes;
}

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

export async function updateIssueState(issueId: string, stateId: string): Promise<void> {
  await linearQuery(`
    mutation UpdateIssue($id: String!, $stateId: String!) {
      issueUpdate(id: $id, input: { stateId: $stateId }) {
        success
      }
    }
  `, { id: issueId, stateId });
}

export async function updateIssueAssignee(issueId: string, assigneeId: string | null): Promise<void> {
  await linearQuery(`
    mutation UpdateIssue($id: String!, $assigneeId: String) {
      issueUpdate(id: $id, input: { assigneeId: $assigneeId }) {
        success
      }
    }
  `, { id: issueId, assigneeId });
}

export async function updateIssuePriority(issueId: string, priority: number): Promise<void> {
  await linearQuery(`
    mutation UpdateIssue($id: String!, $priority: Int!) {
      issueUpdate(id: $id, input: { priority: $priority }) {
        success
      }
    }
  `, { id: issueId, priority });
}

export async function addComment(issueId: string, body: string): Promise<void> {
  await linearQuery(`
    mutation AddComment($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) {
        success
      }
    }
  `, { issueId, body });
}

export async function createIssue(input: {
  title: string;
  description?: string;
  stateId?: string;
  assigneeId?: string;
  priority?: number;
  labelIds?: string[];
  teamId: string;
}): Promise<string> {
  const data = await linearQuery<{ issueCreate: { issue: { id: string } } }>(`
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id }
      }
    }
  `, { input });
  return data.issueCreate.issue.id;
}
