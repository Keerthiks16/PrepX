export const NETWORKING_TEMPLATES = {
    "Connect - fresher": `Hi [Name],

I saw that you're part of the team at [Company], and I noticed there's an opening for [specific role].

I'm a [your degree/stream] graduate from [college], and I've recently worked on [internship / project / certification] where I learned [relevant skill].

I'd love to share my resume with you for this role if you're open to it. Thank you for your time!`,

    "Connect - direct": `Hi, I'm [Name]. I noticed you lead [Department] at [Company], there's an opening advertised for this role. I'd love to apply for it, let me know if I can share my CV with you. I'm a [Qualification] with [Years] of experience in [Expertise]`,

    "Referral - admire": `Hi [Name],

Hope you're doing well. I came across your profile while researching [Company] and noticed you're working as a [Role].

I'm currently exploring opportunities in [Role] and genuinely admire the work [Company] is doing in [Area].

If you're comfortable, I'd really appreciate a referral or even quick guidance on the best way to apply. Happy to share my resume or any details you need.

Thanks so much for your time!`,

    "Referral - alumni": `Hi [Name],

I hope you're having a great week. I noticed we share a background in [College/Domain], and you're currently at [Company] - that caught my attention.

I've applied (or plan to apply) for the [Job Title] role and believe my experience in [Skills] aligns well with the team.

If you feel my profile could be a fit, I'd be grateful if you'd consider referring me. Of course, no pressure at all - I appreciate your time either way.

Thanks!`,

    "Referral - direct": `Hi [Name],

Quick note - I'm applying for the [Role] at [Company] and saw you're part of the team.

I have [Years] experience in [Skills] and recently worked on [Project]. Would you be open to referring me if you think my profile fits?

Happy to share my resume. Thanks for considering!

Best,
[Name]`,

    "Warm Lead - value": `Hello [Name],

I came across the job opportunity for [Job Title] from your department, which matches my expertise in [Industry].

I sincerely believe that my experiences align with the job responsibilities mentioned above, like [Skills]. Moreover, I do not consider myself an ordinary [Role] as I always keep entrepreneurial skills in perspective. Therefore, thinking from [Industry] mindset makes me stand out.

If you think these qualities are a potential fit and my skills could be an asset to your company, I would love to get on a call and see if we can move forward.`,

    "Hiring Manager - strategic": `Hello [Name],

I came across your profile and was impressed by your journey in [Company], especially your work around [Project].

My background is in [Skills] which directly aligns with the role that [Company] demands. But more importantly, I have never approached my work like a checkbox employee. I bring a mix of specific Leadership and entrepreneurial skills, and a sharp understanding of the industry, which allows me to solve problems with a broader, more strategic lens.

I would genuinely love to hear your perspective on what makes someone successful in this role. Would you be open to a quick 17-minute coffee chat this week or next?

Even passing this along to the HR on your team would truly mean a lot.`,

    "Recruiter - strategic": `Hello [Name],

I came across the job opportunity for [Job Title] from your department, which matches my expertise.

My background is in [Skills] which directly aligns with the role that [Company] demands. But more importantly, I have never approached my work like a checkbox employee. I bring a mix of strategic and entrepreneurial skills which allows me to solve problems with a broader lens.

I would genuinely love to hear your perspective on what makes someone successful in this role. Would you be open to a quick 14-minute coffee chat this week or next?

Even passing this along to the concerned HR on your team would truly mean a lot.`,

    "Follow Up - application": `Hello [Name],

I came across the job opportunity for [Job Title] from your department, which matches my expertise.

My background is in [Skills] which directly aligns with the role that [Company] demands. But more importantly, I have never approached my work like a checkbox employee. I bring a mix of strategic skills which allows me to solve problems with a broader lens.

I would genuinely love to hear your perspective on my application (ID: [App ID]) and what makes someone successful in this role. Would you be open to a quick 17-minute coffee chat this week or next?

Even passing this along to the concerned HR on your team would truly mean a lot.`,

    "Follow Up - standard": `Hello [Name],

Did you get a chance to go through my last email?

I am eagerly looking forward to working at [Company] and bringing something new to the table.

Please let me know if there is anything I can do to make the process smoother.`
};

export type TemplateKey = keyof typeof NETWORKING_TEMPLATES;
