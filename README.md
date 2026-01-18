# Huddle
Huddle is a platform that keeps long distance families in touch. Whether it's students moving away for school, or parents going on long term vacations, Huddle can bring your family together.

## Inspiration
As students move away for school, staying connected with family can become harder than expected. Busy schedules, time zones, and distance often make regular communication difficult. Members of our team and many other families have experienced this story. We wanted to create a simple, meaningful way for families to stay close, even when they’re far apart.

## What it does
Huddle is a simple social platform that is limited to members of your family, removing the clutter from mainstream social media sites. Users can make a private family and invite other family members to join it using a simple join code. Inside of a family users can make posts that consist of text, photos, and videos. Users can also react to posts and leave text or voice comments.

Family members can respond to a "Question of the day", promoting deeper connections between family members. We've also implemented a simple game with a daily leaderboard. Family members can compete for the best score, and this can help spark conversations through friendly competition. 

## How we built it
Huddle is a web app built with Next.js and Supabase. We placed a large emphasis on a simple UI/UX experience, making it easy for seniors who are less familiar with technology to engage with the platform. Supabase handles our database, media storage, and authentication.

## Challenges we ran into
One of the main challenges we ran into was managing version control earlier in the project. There was minimal pages which meant many of us were working on the same file leading to some pretty major merge conflicts. We eventually came together and made a system for making branches and PRs that helped resolve many of these issues.

Some of us were newer to full stack work, and learning how to work in this environment was a bit of a learning curve, but by the end we were all more confident in this area. 

## Accomplishments that we're proud of
We’re really proud of what we were able to build for Huddle in such a short amount of time. We implemented an online status feature so users can see when others are active, which helps make interactions feel more real and connected. We also added engaging features like a game and a leaderboard to encourage participation and friendly competition. On the backend, we successfully connected the app to Supabase, allowing us to reliably store and manage user information, which gave us a strong foundation to build on moving forward.

## What we learned
Once we had someone working on a UI refresh on a component, and someone else was adding functionality to the component. As you can imagine this resulted in a pretty big merge conflict that was hard to resolve. We tried using GitHub's newer AI features, and added a comment to the PR that said "@copilot, resolve the merge conflicts in this PR, keeping the UI updates, but also keeping the new functionality". Copilot spun up an instance of our project, understood the conflict, and resolved it for us. 



## What's next for Huddle
The next step for Huddle is to implement features we didn’t have time to complete during the hackathon. One feature we hope to add is a personalized notification system that allows users to send messages of warmth and care to individuals. We also plan to integrate the OpenAI API to enhance the daily games by improving question quality and introducing greater variety. Additionally, we aim to transition Huddle from a website to a mobile app, making it more accessible and convenient for users.
