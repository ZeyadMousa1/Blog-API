# ERD: blogAPI

This document explores the design of blogAPI, a social experience for sharing useful your blog.

We'll use a basic server architecture, where the server is deployed
on a cloud provider next to a relational database, and serving HTTP traffic from
a public endpoint.

## Storage

We'll use a relational database (schema follows) to fast retrieval of posts and
comments and etc .. A database implementation such as MySQl.
Data will be stored on the server on a separate, backed
up volume for resilience. There will be no replication or sharding of data at
this early stage.

## Schema

We'll need at least the following entities to implement the service:

**Users**
| Column | Type |
|---------------------------|--------------------|
| ID | STRING/UUID |
| Username | STRING |
| Password | STRING |
| Email | STRING |
| Bio | STRING |
| ProfilePhoto | STRING |
| PhotoPublicId | STRING |
| IsAdmin | BOOLEAN |
| IsAccountVerified | BOOLEAN |
| EmailVerificationToken | STRING |
| PasswordResetToken | STRING |
| PasswordResetTokenExpires | DATETIME |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

**Posts**
| Column | Type |
|-----------------|-------------|
| ID | STRING/UUID |
| Title | STRING |
| Description | STRING |
| Email | STRING |
| Image | STRING |
| ImagePublicId | STRING |
| PhotoPublicId | STRING |
| UserId | STRING/UUID |
| CategoryId | STRING/UUID |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

**Likes**
| Column | Type |
|-----------------|-------------|
| ID | STRING/UUID |
| UserId | STRING/UUID |
| PostId | STRING/UUID |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

**Comments**
| Column | Type |
|-----------------|-------------|
| ID | STRING/UUID |
| Title | STRING |
| UserId | STRING/UUID |
| PostId | STRING/UUID |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

**Categories**
| Column | Type |
|-----------------|-------------|
| ID | STRING/UUID |
| Title | STRING |
| UserId | STRING/UUID |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

**Relationships**
| Column | Type |
|-----------------|-------------|
| ID | STRING/UUID |
| FollowingId | STRING/UUID |
| FollowerId | STRING/UUID |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

**PostsBookMarks**
| Column | Type |
|-----------------|-------------|
| ID | STRING/UUID |
| UserId | STRING/UUID |
| PostId | STRING/UUID |
| CreatedAt | DATETIME |
| UpdatedAt | DATETIME |

## Server

A simple HTTP server is responsible for authentication, serving stored data, and
potentially ingesting and serving analytics data.

-  Node.js is selected for implementing the server for speed of development.
-  Express.js is the web server framework.
-  Prisma to be used as an ORM.

### Auth

For v1, JWT-based auth mechanism is to be used, with passwords
encrypted and stored in the database. potentially added OAuth
for Google + Facebook and maybe others (Github?).

### API

**Auth**:

```
/auth/signIn          [POST]
/auth/signUp          [POST]
/auth/forgetPassword  [GET]
/auth/resetPassword   [PATCH]
```

**Users**

```
/users/profile                        [GET]
/users/profile                        [POST]
/users/profile/profile-photo-upload   [GET]
/users/profile/search                 [GET]
/users/profile/:id                    [GET]
/users/profile/:id                    [PUT]
/users/profile/:id                    [DELETE]
/users/count                          [GET]
```

**Posts**

```
/posts                    [GET]
/posts                    [POST]
/posts/search             [GET]
/posts/:id                [GET]
/posts/:id                [PUT]
/posts/:id                [DELETE]
/posts/update-image/:id   [PUT]
```

**Comments**

```
/comments           [GET]
/comments           [POST]
/comments/:id       [PUT]
/comments/:id       [DELETE]
/comments/:postId   [GET]
```

**Likes**

```
/likes/postId   [PUT]
/likes/postId   [GET]
```

**Categories**

```
/categories       [GET]
/categories       [POST]
/categories/:id   [DELETE]
```

**BookMarks**

```
/book-marks       [GET]
/book-marks/id    [POST]
/book-marks/:id   [DELETE]
```

**Relationships**

```
/follow/userId      [POST]
/follow/following   [GET]
/follow/followers   [GET]
```

## Hosting

The code will be hosted on Github, PRs and issues welcome.

We'll deploy the server to a (likely shared) VPS for flexibility. The VM will have
HTTP/HTTPS ports open, and we'll start with a manual deployment, to be automated
later using Github actions or similar. The server will have closed CORS policy except
for the domain name and the web host server.
