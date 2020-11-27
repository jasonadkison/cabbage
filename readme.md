# Cabbage

Cabbage is my play area for learning about 
[Supabase](https://github.com/supabase/supabase).

Doesn't even have an app that uses the DB yet, at the moment it's just code 
for managing a schema across different SB databases ("projects").

I'm using Gradle, Flyway, Java etc. just because they're the tools that I know 
best, not saying this is the right way to do it.

## Structure 

* [.github](/.github)
* [/app/](/app) - client app
* [/database/](/database) - database schema management
  * gradle sub-project 
  * uses Flyway, connects to Supabase via `postgres://` protocol
* [/gradle/](/gradle) - gradle wrapper stuff
  * used for bootstrapping Gradle
  
