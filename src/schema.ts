import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    me: User
    posts: [Post!]!
    profile(userId: ID!): Profile
  }
  type Mutation {
    postCreate(post: PostInput!): PostPayload!
    postUpdate(postId: ID!, post: PostInput!): PostPayload!
    postDelete(postId: ID!): PostPayload!
    signup(
      name: String!
      bio: String!
      credentials: CredentialsInput!
    ): AuthPayload!
    signin(credentials: CredentialsInput!): AuthPayload!
    postPublish(postId: ID!): PostPayload!
    postUnpublish(postId: ID!): PostPayload!
  }
  type Post {
    id: ID!
    title: String!
    content: String!
    createdAt: String!
    published: Boolean!
    user: User!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    profile: Profile!
    posts: [Post!]!
  }
  type Profile {
    id: ID!
    isMyProfile: Boolean!
    bio: String!
    user: User!
  }
  type UserError {
    message: String!
  }
  type PostPayload {
    userError: [UserError!]!
    post: Post
  }
  input PostInput {
    title: String
    content: String
  }
  type AuthPayload {
    userError: [UserError!]!
    token: String
  }
  input CredentialsInput {
    email: String!
    password: String!
  }
`;
