import psycopg2
from config import load_config


def find_matching_jobs(resume_id):
    # Load database configuration and establish a connection
    db_config = load_config()
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()

    # SQL query to find skills for the given resume
    resume_skills_query = """
    SELECT skillname
    FROM skills
    WHERE userID = (
        SELECT userID FROM resume WHERE resumeID = %s
    )
    """
    cur.execute(resume_skills_query, (resume_id,))
    resume_skills = cur.fetchall()
    resume_skill_set = {skill[0] for skill in resume_skills}

    # SQL query to get job postings and their required skills
    job_skills_query = "SELECT jobPostingID, skillname FROM jobApplicationSkills"
    cur.execute(job_skills_query)
    job_skills = cur.fetchall()

    # Process job skills and calculate match percentages
    job_requirements = {}
    for job_id, skill in job_skills:
        if job_id not in job_requirements:
            job_requirements[job_id] = set()
        job_requirements[job_id].add(skill)

    job_match_percentage = {}
    for job_id, required_skills in job_requirements.items():
        matched_skills = resume_skill_set.intersection(required_skills)
        match_percentage = (len(matched_skills) / len(required_skills)) * 100
        job_match_percentage[job_id] = match_percentage

    # Sort job postings by match percentage in descending order
    sorted_job_matches = sorted(
        job_match_percentage.items(), key=lambda x: x[1], reverse=True
    )

    # Fetch job posting titles and company names for the sorted job IDs AFTER sorting
    job_ids = [job_id for job_id, _ in sorted_job_matches]
    if job_ids:  # Only execute if there are job IDs to query
        job_titles_query = """
        SELECT cjp.jobPostingID, cjp.jobPostingTitle, cmp.companyname
        FROM companyJobPostings cjp
        JOIN companies cmp ON cjp.companyid = cmp.companyID
        WHERE cjp.jobPostingID = ANY(%s)
        """
        cur.execute(job_titles_query, (job_ids,))
        job_titles_companies = cur.fetchall()
        job_info_dict = {
            job_id: (title, company) for job_id, title, company in job_titles_companies
        }

        # Print the matching jobs with percentages and company names
        for job_id, match_percentage in sorted_job_matches:
            job_title, company_name = job_info_dict.get(job_id, ("Unknown", "Unknown"))
            print(
                f"Job Title: {job_title}, Company: {company_name}, Match Percentage: {match_percentage:.2f}%"
            )
    else:
        print("No matching jobs found.")

    # Clean up
    cur.close()
    conn.close()


if __name__ == "__main__":
    try:
        resume_id_input = input("Enter the resume ID you want to analyze: ")
        find_matching_jobs(int(resume_id_input))
    except Exception as e:
        print(f"An error occurred: {e}")
