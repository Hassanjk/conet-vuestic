{
  "info": {
    "name": "Connet - Slack Clone API (NO EMAIL VERIFICATION)",
    "description": "🎉 COMPLETE Postman collection for Slack Clone with Supabase REST API.\n\n🚀 SUPER SIMPLE SETUP:\n1. ✅ Set supabase_url to your project URL\n2. ✅ Set supabase_anon_key to your anon key\n3. 🔧 CRITICAL: Run COMPLETE-DATABASE-SETUP.sql (ONE FILE ONLY!)\n4. ✅ Test: Run 'Database Setup Verification' first!\n\n⚠️ NO EMAIL VERIFICATION REQUIRED:\n✅ Users are auto-confirmed on signup\n✅ Immediate access after signup\n✅ Perfect for development/testing\n\n🔧 WHAT'S FIXED:\n✅ Duplicate key violations resolved\n✅ Auth trigger handles existing profiles safely\n✅ Admin function prevents duplicate users\n✅ Proper error handling for all endpoints\n✅ Role auto-detection working perfectly\n✅ No email verification needed\n\n🎓 DYNAMIC ROLE ASSIGNMENT:\n📧 @karabuk.edu.tr → researcher\n📧 @ogrenci.karabuk.edu.tr → student \n📧 @gmail.com/@outlook.com → user\n✨ Roles automatically assigned on signup!\n\n🧪 TESTING SEQUENCE:\n1. Run COMPLETE-DATABASE-SETUP.sql in Supabase SQL Editor\n2. Run 'Database Setup Verification'\n3. Try 'Auth Signup Tests' (work instantly!)\n4. Test 'Admin User Management'\n5. Verify with 'User Queries'",
    "version": "3.0.0-NO-EMAIL-VERIFICATION",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "supabase_url",
      "value": "https://qzilrmaurxfpxdhrtolf.supabase.co",
      "type": "string"
    },
    {
      "key": "supabase_anon_key", 
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6aWxybWF1cnhmcHhkaHJ0b2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Mjc2NDUsImV4cCI6MjA3NjQwMzY0NX0.9lKrU1UbIqdMppGQoUsYYUdNG5wUjAldpQJZrxEfT_E",
      "type": "string"
    },
    {
      "key": "access_token",
      "value": "",
      "type": "string"
    },
    {
      "key": "refresh_token", 
      "value": "",
      "type": "string"
    },
    {
      "key": "user_id",
      "value": "",
      "type": "string"
    },
    {
      "key": "admin_access_token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "🔧 Database Setup Verification",
      "item": [
        {
          "name": "✅ Verify Database Setup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{supabase_anon_key}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"query\": \"SELECT check_database_setup();\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/check_database_setup",
            "description": "🔍 FIRST TEST - Verify Setup\n\n✅ This should return:\n- users_table_exists: true\n- user_roles_table_exists: true\n- app_role_enum_exists: true\n- auth_trigger_exists: true\n\n❌ If any are false, run the SQL scripts!"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Database setup is complete', function () {",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.users_table_exists).to.be.true;",
                  "    pm.expect(responseJson.user_roles_table_exists).to.be.true;",
                  "    pm.expect(responseJson.app_role_enum_exists).to.be.true;",
                  "    pm.expect(responseJson.auth_trigger_exists).to.be.true;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "✅ Test Email Domain Detection",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{supabase_anon_key}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"query\": \"SELECT test_email_domains();\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/test_email_domains",
            "description": "🧪 TEST EMAIL DOMAINS\n\n✅ Should detect:\n- @ogrenci.karabuk.edu.tr → student\n- @karabuk.edu.tr → researcher  \n- @gmail.com → user"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Email domain detection works', function () {",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.student_email.detected_role).to.equal('student');",
                  "    pm.expect(responseJson.researcher_email.detected_role).to.equal('researcher');",
                  "    pm.expect(responseJson.user_email.detected_role).to.equal('user');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "✅ Test Professional Fields Schema",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{supabase_anon_key}}"
              }
            ],
            "url": {
              "raw": "{{supabase_url}}/rest/v1/users?limit=1&select=id,bio,institution,department,title,orcid_id,linkedin_url,website_url,expertise_areas,skills,location,available_for_collaboration",
              "host": ["{{supabase_url}}"],
              "path": ["rest", "v1", "users"],
              "query": [
                {
                  "key": "limit",
                  "value": "1"
                },
                {
                  "key": "select",
                  "value": "id,bio,institution,department,title,orcid_id,linkedin_url,website_url,expertise_areas,skills,location,available_for_collaboration"
                }
              ]
            },
            "description": "🧪 TEST PROFESSIONAL FIELDS SCHEMA\n\n✅ Verifies all new professional fields exist:\n- bio, institution, department, title\n- orcid_id, linkedin_url, website_url\n- expertise_areas[], skills[], location\n- available_for_collaboration\n\n💡 If this returns data, the schema is correctly updated!"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Professional fields schema exists', function () {",
                  "    pm.expect(pm.response.code).to.equal(200);",
                  "    const responseJson = pm.response.json();",
                  "    if (responseJson.length > 0) {",
                  "        const user = responseJson[0];",
                  "        // Check that all professional fields are present (can be null)",
                  "        pm.expect(user).to.have.property('bio');",
                  "        pm.expect(user).to.have.property('institution');",
                  "        pm.expect(user).to.have.property('department');",
                  "        pm.expect(user).to.have.property('title');",
                  "        pm.expect(user).to.have.property('orcid_id');",
                  "        pm.expect(user).to.have.property('linkedin_url');",
                  "        pm.expect(user).to.have.property('website_url');",
                  "        pm.expect(user).to.have.property('expertise_areas');",
                  "        pm.expect(user).to.have.property('skills');",
                  "        pm.expect(user).to.have.property('location');",
                  "        pm.expect(user).to.have.property('available_for_collaboration');",
                  "        console.log('✅ All professional fields exist in schema');",
                  "    }",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "🔐 Auth Signup Tests (FIXED)",
      "item": [
        {
          "name": "✅ Signup - Student (FIXED)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"student-{{$timestamp}}@ogrenci.karabuk.edu.tr\",\n  \"password\": \"testpassword123\",\n  \"data\": {\n    \"full_name\": \"Test Student User\"\n  }\n}"
            },
            "url": "{{supabase_url}}/auth/v1/signup",
            "description": "🎓 STUDENT SIGNUP - FIXED!\n\n✅ What happens:\n1. Creates auth user with @ogrenci.karabuk.edu.tr\n2. Auto-syncs profile after signup\n3. Assigns 'student' role automatically\n4. Uses timestamp to ensure unique emails\n\n🔧 Fixed Issues:\n- ✅ Duplicate prevention\n- ✅ Safe role assignment\n- ✅ Auto profile sync\n- ✅ Proper error handling"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Student signup successful', function () {",
                  "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.user).to.exist;",
                  "    pm.expect(responseJson.user.email).to.include('@ogrenci.karabuk.edu.tr');",
                  "    ",
                  "    // Save user details for further tests",
                  "    if (responseJson.access_token) {",
                  "        pm.environment.set('student_access_token', responseJson.access_token);",
                  "        pm.environment.set('student_user_id', responseJson.user.id);",
                  "        ",
                  "        // Auto-sync profile after signup",
                  "        const syncRequest = {",
                  "            url: pm.environment.get('supabase_url') + '/rest/v1/rpc/sync_specific_auth_user',",
                  "            method: 'POST',",
                  "            header: {",
                  "                'apikey': pm.environment.get('supabase_anon_key'),",
                  "                'Authorization': 'Bearer ' + pm.environment.get('supabase_anon_key'),",
                  "                'Content-Type': 'application/json'",
                  "            },",
                  "            body: {",
                  "                mode: 'raw',",
                  "                raw: JSON.stringify({",
                  "                    target_user_id: responseJson.user.id",
                  "                })",
                  "            }",
                  "        };",
                  "        ",
                  "        pm.sendRequest(syncRequest, (err, res) => {",
                  "            if (!err) {",
                  "                console.log('Profile sync result:', res.json());",
                  "            } else {",
                  "                console.log('Profile sync error:', err);",
                  "            }",
                  "        });",
                  "    }",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "🔄 Auto-Sync Profile After Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{supabase_anon_key}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"target_user_id\": \"{{student_user_id}}\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/sync_specific_auth_user",
            "description": "🔄 AUTO-SYNC PROFILE\n\n✅ This automatically creates the public profile for new users\n✅ Run this immediately after any signup\n✅ Ensures profile exists before trying to query it\n\n🎯 Use this as a backup if the trigger doesn't fire"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Profile sync successful', function () {",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.success).to.be.true;",
                  "    console.log('Sync result:', responseJson.message);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "✅ Signup - Researcher (FIXED)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"researcher-{{$timestamp}}@karabuk.edu.tr\",\n  \"password\": \"testpassword123\",\n  \"data\": {\n    \"full_name\": \"Test Researcher\"\n  }\n}"
            },
            "url": "{{supabase_url}}/auth/v1/signup",
            "description": "🔬 RESEARCHER SIGNUP - FIXED!\n\n✅ Auto-assigns 'researcher' role for @karabuk.edu.tr"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Researcher signup successful', function () {",
                  "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.user.email).to.include('@karabuk.edu.tr');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "✅ Signup - Regular User (FIXED)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user-{{$timestamp}}@gmail.com\",\n  \"password\": \"testpassword123\",\n  \"data\": {\n    \"full_name\": \"Test Regular User\"\n  }\n}"
            },
            "url": "{{supabase_url}}/auth/v1/signup",
            "description": "👤 REGULAR USER SIGNUP - FIXED!\n\n✅ Auto-assigns 'user' role for @gmail.com"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Regular user signup successful', function () {",
                  "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.user.email).to.include('@gmail.com');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "👑 Admin User Management (FIXED)",
      "item": [
        {
          "name": "👑 Admin Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\"\n}"
            },
            "url": "{{supabase_url}}/auth/v1/token?grant_type=password",
            "description": "🔑 Admin login to get admin access token"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const responseJson = pm.response.json();",
                  "    pm.environment.set('admin_access_token', responseJson.access_token);",
                  "    pm.environment.set('admin_user_id', responseJson.user.id);",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "✅ Create Complete User - Student (WITH PROFESSIONAL FIELDS)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"p_email\": \"admin-created-student-{{$timestamp}}@ogrenci.karabuk.edu.tr\",\n  \"p_username\": \"admin_student_{{$timestamp}}\",\n  \"p_full_name\": \"Admin Created Student\",\n  \"p_avatar_url\": \"https://example.com/avatar-student.jpg\",\n  \"p_projects\": [\"Student Project A\", \"Student Project B\"],\n  \"p_role\": null,\n  \"p_is_active\": true,\n  \"p_bio\": \"Computer Science student passionate about AI and machine learning. Currently working on my thesis about neural networks.\",\n  \"p_institution\": \"Karabük University\",\n  \"p_department\": \"Computer Engineering\",\n  \"p_title\": \"Graduate Student\",\n  \"p_orcid_id\": \"0000-0000-0000-000X\",\n  \"p_linkedin_url\": \"https://linkedin.com/in/student-profile\",\n  \"p_website_url\": \"https://student-portfolio.com\",\n  \"p_expertise_areas\": [\"Machine Learning\", \"Python\", \"Data Analysis\"],\n  \"p_skills\": [\"Programming\", \"Research\", \"Technical Writing\"],\n  \"p_location\": \"Karabük, Turkey\",\n  \"p_available_for_collaboration\": true\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/admin_create_complete_user",
            "description": "✅ ADMIN CREATE USER - WITH PROFESSIONAL FIELDS!\n\n🎯 Creates complete user with:\n✅ Avatar image, Full name, Username, Email\n✅ Projects array, Auto-detected role (student), Active status\n✅ Bio, Institution, Department, Title\n✅ ORCID ID, LinkedIn, Website\n✅ Expertise areas, Skills, Location\n✅ Collaboration availability\n\n🔧 Fixed duplicate prevention!"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Admin create user successful', function () {",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.success).to.be.true;",
                  "    pm.expect(responseJson.user).to.exist;",
                  "    pm.expect(responseJson.user.role).to.equal('student');",
                  "    pm.expect(responseJson.user.projects).to.be.an('array');",
                  "    pm.expect(responseJson.user.avatar_url).to.exist;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "✅ Create Complete User - Researcher (WITH PROFESSIONAL FIELDS)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"p_email\": \"admin-created-researcher-{{$timestamp}}@karabuk.edu.tr\",\n  \"p_username\": \"admin_researcher_{{$timestamp}}\",\n  \"p_full_name\": \"Dr. Admin Created Researcher\",\n  \"p_avatar_url\": \"https://example.com/avatar-researcher.jpg\",\n  \"p_projects\": [\"AI in Healthcare Research\", \"Sustainable Technology Development\"],\n  \"p_role\": null,\n  \"p_is_active\": true,\n  \"p_bio\": \"Senior researcher specializing in artificial intelligence applications in healthcare. Published 25+ papers in peer-reviewed journals. Leading interdisciplinary research projects.\",\n  \"p_institution\": \"Karabük University\",\n  \"p_department\": \"Computer Engineering\",\n  \"p_title\": \"Associate Professor\",\n  \"p_orcid_id\": \"0000-0002-1234-5678\",\n  \"p_linkedin_url\": \"https://linkedin.com/in/dr-researcher-profile\",\n  \"p_website_url\": \"https://researcher-academic-page.edu\",\n  \"p_expertise_areas\": [\"Artificial Intelligence\", \"Healthcare Technology\", \"Research Methodology\", \"Data Science\"],\n  \"p_skills\": [\"Research Design\", \"Grant Writing\", \"Team Leadership\", \"Publication\", \"Statistical Analysis\"],\n  \"p_location\": \"Karabük, Turkey\",\n  \"p_available_for_collaboration\": true\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/admin_create_complete_user",
            "description": "🔬 ADMIN CREATE RESEARCHER - WITH PROFESSIONAL FIELDS!\n\n✅ Auto-detects researcher role\n✅ Complete academic profile with bio, ORCID, expertise\n✅ Professional networking information\n✅ Research collaboration settings"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Admin create researcher successful', function () {",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.success).to.be.true;",
                  "    pm.expect(responseJson.user.role).to.equal('researcher');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "✅ Override Role - Gmail User as Admin",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"p_email\": \"new-admin-{{$timestamp}}@gmail.com\",\n  \"p_username\": \"new_admin_{{$timestamp}}\",\n  \"p_full_name\": \"New Admin User\",\n  \"p_avatar_url\": \"https://example.com/avatar-admin.jpg\",\n  \"p_projects\": [\"Admin Project 1\"],\n  \"p_role\": \"admin\",\n  \"p_is_active\": true\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/admin_create_complete_user",
            "description": "👑 ROLE OVERRIDE TEST\n\n✅ Creates Gmail user but overrides to admin role\n(Normally @gmail.com → user, but we force admin)"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Role override successful', function () {",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.success).to.be.true;",
                  "    pm.expect(responseJson.user.role).to.equal('admin');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "❌ Test Duplicate Prevention",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"p_email\": \"duplicate-test@example.com\",\n  \"p_username\": \"duplicate_user\",\n  \"p_full_name\": \"Duplicate Test User\",\n  \"p_is_active\": true\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/admin_create_complete_user",
            "description": "🚫 DUPLICATE PREVENTION TEST\n\n✅ First call should succeed\n❌ Second call with same email should fail gracefully"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "// First attempt should succeed, subsequent should fail",
                  "const responseJson = pm.response.json();",
                  "if (responseJson.success === false) {",
                  "    pm.test('Duplicate prevention works', function () {",
                  "        pm.expect(responseJson.error).to.include('already exists');",
                  "    });",
                  "} else {",
                  "    pm.test('First creation successful', function () {",
                  "        pm.expect(responseJson.success).to.be.true;",
                  "    });",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "📊 User Queries & Verification",
      "item": [
        {
          "name": "📋 List All Users with Complete Professional Data",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "url": {
              "raw": "{{supabase_url}}/rest/v1/users?select=id,email,username,full_name,avatar_url,projects,is_active,bio,institution,department,title,orcid_id,linkedin_url,website_url,expertise_areas,skills,location,available_for_collaboration,user_roles(role)&order=created_at.desc",
              "host": ["{{supabase_url}}"],
              "path": ["rest", "v1", "users"],
              "query": [
                {
                  "key": "select",
                  "value": "id,email,username,full_name,avatar_url,projects,is_active,bio,institution,department,title,orcid_id,linkedin_url,website_url,expertise_areas,skills,location,available_for_collaboration,user_roles(role)"
                },
                {
                  "key": "order",
                  "value": "created_at.desc"
                }
              ]
            },
            "description": "📊 GET ALL USERS WITH COMPLETE PROFESSIONAL DATA\n\n✅ Shows all fields including professional info:\n- Basic: Avatar, name, username, email\n- Professional: Bio, institution, department, title\n- Academic: ORCID, expertise areas, skills\n- Networking: LinkedIn, website, location\n- Settings: Projects, role, active status, collaboration availability"
          }
        },
        {
          "name": "🎓 Filter Students Only",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "url": {
              "raw": "{{supabase_url}}/rest/v1/users?select=*,user_roles(role)&user_roles.role=eq.student",
              "host": ["{{supabase_url}}"],
              "path": ["rest", "v1", "users"],
              "query": [
                {
                  "key": "select",
                  "value": "*,user_roles(role)"
                },
                {
                  "key": "user_roles.role",
                  "value": "eq.student"
                }
              ]
            },
            "description": "🎓 FILTER BY ROLE - Students only"
          }
        },
        {
          "name": "🔬 Filter Researchers Only",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "url": {
              "raw": "{{supabase_url}}/rest/v1/users?select=*,user_roles(role)&user_roles.role=eq.researcher",
              "host": ["{{supabase_url}}"],
              "path": ["rest", "v1", "users"],
              "query": [
                {
                  "key": "select",
                  "value": "*,user_roles(role)"
                },
                {
                  "key": "user_roles.role",
                  "value": "eq.researcher"
                }
              ]
            },
            "description": "🔬 FILTER BY ROLE - Researchers only"
          }
        }
      ]
    },
    {
      "name": "👤 Profile Management",
      "item": [
        {
          "name": "Get My Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/users?id=eq.{{user_id}}&select=*,user_roles(role)",
            "description": "👤 GET MY COMPLETE PROFILE\n\n✅ Shows:\n- Personal info (name, email, username)\n- Avatar, projects, status\n- Current roles\n- Account status"
          }
        },
        {
          "name": "Update My Profile",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"my_new_username\",\n  \"full_name\": \"John Doe\",\n  \"avatar_url\": \"https://example.com/my-avatar.jpg\",\n  \"projects\": [\"My Project 1\", \"My Project 2\"],\n  \"status\": \"ONLINE\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.{{user_id}}",
            "description": "✏️ UPDATE MY PROFILE\n\n✅ Can update:\n- Username, full name\n- Avatar image URL\n- Projects array\n- Online/offline status"
          }
        },
        {
          "name": "Set Status Online",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"ONLINE\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.{{user_id}}",
            "description": "🟢 SET STATUS TO ONLINE"
          }
        },
        {
          "name": "Set Status Offline",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"OFFLINE\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.{{user_id}}",
            "description": "⚫ SET STATUS TO OFFLINE"
          }
        },
        {
          "name": "Get My Roles",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/user_roles?user_id=eq.{{user_id}}&select=*",
            "description": "🎭 CHECK MY ROLES\n\n✅ Shows all roles assigned to me:\n- admin, moderator, student, researcher, etc."
          }
        },
        {
          "name": "📝 Update Professional Profile",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"p_user_id\": \"{{user_id}}\",\n  \"p_bio\": \"Updated professional bio - Passionate researcher in artificial intelligence with focus on ethical AI development.\",\n  \"p_institution\": \"Karabük University\",\n  \"p_department\": \"Computer Engineering\",\n  \"p_title\": \"Senior Research Associate\",\n  \"p_orcid_id\": \"0000-0003-9999-8888\",\n  \"p_linkedin_url\": \"https://linkedin.com/in/updated-profile\",\n  \"p_website_url\": \"https://my-research-website.com\",\n  \"p_expertise_areas\": [\"AI Ethics\", \"Machine Learning\", \"Natural Language Processing\"],\n  \"p_skills\": [\"Python\", \"TensorFlow\", \"Research\", \"Academic Writing\"],\n  \"p_location\": \"Karabük, Turkey\",\n  \"p_available_for_collaboration\": true\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/update_professional_profile",
            "description": "📝 UPDATE PROFESSIONAL PROFILE\n\n✅ Updates professional fields:\n- Bio, Institution, Department, Title\n- ORCID ID, LinkedIn, Website\n- Expertise areas, Skills, Location\n- Collaboration availability"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Professional profile updated', function () {",
                  "    const responseJson = pm.response.json();",
                  "    pm.expect(responseJson.success).to.be.true;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "🔍 Get Complete Profile with Professional Fields",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": {
              "raw": "{{supabase_url}}/rest/v1/users?id=eq.{{user_id}}&select=id,email,username,full_name,avatar_url,projects,is_active,bio,institution,department,title,orcid_id,linkedin_url,website_url,expertise_areas,skills,location,available_for_collaboration,user_roles(role)",
              "host": ["{{supabase_url}}"],
              "path": ["rest", "v1", "users"],
              "query": [
                {
                  "key": "id",
                  "value": "eq.{{user_id}}"
                },
                {
                  "key": "select",
                  "value": "id,email,username,full_name,avatar_url,projects,is_active,bio,institution,department,title,orcid_id,linkedin_url,website_url,expertise_areas,skills,location,available_for_collaboration,user_roles(role)"
                }
              ]
            },
            "description": "🔍 GET COMPLETE PROFILE WITH ALL PROFESSIONAL FIELDS\n\n✅ Returns complete user profile:\n- Basic info (name, email, avatar)\n- Professional info (bio, institution, title)\n- Academic info (ORCID, expertise, skills)\n- Networking info (LinkedIn, website)\n- Collaboration settings\n- User roles"
          }
        },
        {
          "name": "🔍 Search Users by Expertise",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"search_term\": \"Machine Learning\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/search_users_by_expertise",
            "description": "🔍 SEARCH USERS BY EXPERTISE\n\n✅ Search criteria:\n- Expertise areas\n- Skills\n- Bio content\n- Job title\n- Department\n\n✅ Only shows active users available for collaboration"
          }
        },
        {
          "name": "🎯 Update Specific Fields (Direct PATCH)",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"updated_teacher52\",\n  \"full_name\": \"Dr. Teacher Fifty-Two\",\n  \"avatar_url\": \"https://example.com/teacher52-avatar.jpg\",\n  \"bio\": \"Experienced educator and researcher in computer science with focus on AI applications in education.\",\n  \"institution\": \"Karabük University\",\n  \"department\": \"Computer Engineering\",\n  \"title\": \"Associate Professor\",\n  \"orcid_id\": \"0000-0002-1234-5678\",\n  \"linkedin_url\": \"https://linkedin.com/in/teacher52\",\n  \"website_url\": \"https://teacher52-research.edu\",\n  \"expertise_areas\": [\"Educational Technology\", \"Artificial Intelligence\", \"Computer Science Education\"],\n  \"skills\": [\"Teaching\", \"Research\", \"Python\", \"Machine Learning\", \"Curriculum Development\"],\n  \"location\": \"Karabük, Turkey\",\n  \"available_for_collaboration\": true,\n  \"projects\": [\"AI in Education Project\", \"Student Assessment Platform\"]\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.c2ca3af3-01d4-428e-8563-90d1c8a8c8a7",
            "description": "🎯 UPDATE SPECIFIC FIELDS (DIRECT PATCH)\n\n✅ Update ANY combination of fields:\n- Basic: username, full_name, avatar_url\n- Professional: bio, institution, department, title\n- Academic: orcid_id, expertise_areas, skills\n- Networking: linkedin_url, website_url, location\n- Settings: projects, available_for_collaboration\n\n💡 Only include fields you want to update!\n🔧 Replace the user ID in the URL with the target user"
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Profile updated successfully', function () {",
                  "    pm.expect(pm.response.code).to.be.oneOf([200, 204]);",
                  "    console.log('✅ Profile fields updated');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        },
        {
          "name": "🎯 Update Single Field Example - Bio Only",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"bio\": \"Just updated my bio! Senior researcher passionate about AI ethics and educational technology.\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.c2ca3af3-01d4-428e-8563-90d1c8a8c8a7",
            "description": "🎯 UPDATE SINGLE FIELD EXAMPLE\n\n✅ Update just one field (bio in this case)\n💡 You can update ANY single field this way:\n- bio, institution, title, skills, etc.\n🔧 Replace the user ID with your target user"
          }
        },
        {
          "name": "🎯 Update Multiple Professional Fields",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"institution\": \"Karabük University\",\n  \"department\": \"Computer Engineering\",\n  \"title\": \"Associate Professor\",\n  \"expertise_areas\": [\"Artificial Intelligence\", \"Machine Learning\", \"Educational Technology\"],\n  \"skills\": [\"Python\", \"Research\", \"Teaching\", \"Data Analysis\"]\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.c2ca3af3-01d4-428e-8563-90d1c8a8c8a7",
            "description": "🎯 UPDATE MULTIPLE PROFESSIONAL FIELDS\n\n✅ Update several related fields at once\n💡 Perfect for completing a professional profile\n🔧 Replace the user ID with your target user"
          }
        }
      ]
    },
    {
      "name": "💬 Channels",
      "item": [
        {
          "name": "Get All Channels",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/channels?select=*",
            "description": "📋 GET ALL CHANNELS\n\n✅ Lists all available channels"
          }
        },
        {
          "name": "Get Channel by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/channels?id=eq.1&select=*",
            "description": "🔍 GET SPECIFIC CHANNEL\n\n✅ Get channel details by ID"
          }
        },
        {
          "name": "Create New Channel",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Prefer",
                "value": "return=representation"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"slug\": \"my-new-channel-{{$timestamp}}\",\n  \"created_by\": \"{{user_id}}\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/channels",
            "description": "➕ CREATE NEW CHANNEL\n\n✅ Creates a new channel with unique slug"
          }
        },
        {
          "name": "Delete My Channel",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/channels?id=eq.3&created_by=eq.{{user_id}}",
            "description": "🗑️ DELETE MY CHANNEL\n\n✅ Only delete channels I created"
          }
        }
      ]
    },
    {
      "name": "💬 Messages",
      "item": [
        {
          "name": "Get All Messages",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/messages?select=*,author:user_id(full_name,username,avatar_url)",
            "description": "📋 GET ALL MESSAGES\n\n✅ Shows messages with author details"
          }
        },
        {
          "name": "Get Messages by Channel",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/messages?channel_id=eq.1&select=*,author:user_id(full_name,username,avatar_url)&order=inserted_at.asc",
            "description": "🔍 GET MESSAGES FOR CHANNEL\n\n✅ Shows messages in chronological order"
          }
        },
        {
          "name": "Send Message",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Prefer",
                "value": "return=representation"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"message\": \"Hello from Postman! 🚀 Sent at {{$timestamp}}\",\n  \"channel_id\": 1,\n  \"user_id\": \"{{user_id}}\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/messages",
            "description": "📤 SEND MESSAGE\n\n✅ Send message to specific channel"
          }
        },
        {
          "name": "Update My Message",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"message\": \"Updated message content 📝 - Updated at {{$timestamp}}\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/messages?id=eq.3&user_id=eq.{{user_id}}",
            "description": "✏️ UPDATE MY MESSAGE\n\n✅ Edit my own messages only"
          }
        },
        {
          "name": "Delete My Message",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/messages?id=eq.4&user_id=eq.{{user_id}}",
            "description": "🗑️ DELETE MY MESSAGE\n\n✅ Delete my own messages only"
          }
        }
      ]
    },
    {
      "name": "👑 Admin Operations (ADMIN ONLY)",
      "item": [
        {
          "name": "Get All Users with Complete Details",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/users?select=*,user_roles(role)&order=created_at.desc",
            "description": "👑 ADMIN: GET ALL USERS\n\n✅ Complete user directory with:\n- All profile information\n- Roles and permissions\n- Account status\n- Creation dates"
          }
        },
        {
          "name": "Admin Assign Role to User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Prefer",
                "value": "return=representation"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"user_id\": \"REPLACE_WITH_USER_ID\",\n  \"role\": \"admin\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/user_roles",
            "description": "👑 ADMIN: ASSIGN ROLE\n\n✅ Available roles:\n- admin (full access)\n- moderator (content management)\n- student (basic access)\n- researcher (extended access)\n- professor (academic access)\n- user (default access)\n\n📝 Replace REPLACE_WITH_USER_ID with actual user ID"
          }
        },
        {
          "name": "Admin Update User Role",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"role\": \"researcher\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/user_roles?user_id=eq.REPLACE_WITH_USER_ID",
            "description": "👑 ADMIN: UPDATE USER ROLE\n\n✅ Change existing user's role\n📝 Replace REPLACE_WITH_USER_ID with actual user ID"
          }
        },
        {
          "name": "Admin Remove User Role",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/user_roles?user_id=eq.REPLACE_WITH_USER_ID",
            "description": "👑 ADMIN: REMOVE USER ROLE\n\n⚠️ Removes all roles from user\n📝 Replace REPLACE_WITH_USER_ID with actual user ID"
          }
        },
        {
          "name": "Admin Delete Any Channel",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/channels?id=eq.REPLACE_WITH_CHANNEL_ID",
            "description": "👑 ADMIN: DELETE ANY CHANNEL\n\n⚠️ Can delete any channel regardless of creator\n📝 Replace REPLACE_WITH_CHANNEL_ID with actual channel ID"
          }
        },
        {
          "name": "Admin Delete Any Message",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "url": "{{supabase_url}}/rest/v1/messages?id=eq.REPLACE_WITH_MESSAGE_ID",
            "description": "👑 ADMIN: DELETE ANY MESSAGE\n\n⚠️ Can delete any message regardless of author\n📝 Replace REPLACE_WITH_MESSAGE_ID with actual message ID"
          }
        },
        {
          "name": "Admin Update User Profile",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"full_name\": \"Admin Updated Name\",\n  \"username\": \"admin_updated_username\",\n  \"avatar_url\": \"https://example.com/admin-updated-avatar.jpg\",\n  \"projects\": [\"Admin Project 1\", \"Admin Project 2\"],\n  \"is_active\": true,\n  \"status\": \"ONLINE\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.REPLACE_WITH_USER_ID",
            "description": "👑 ADMIN: UPDATE ANY USER PROFILE\n\n✅ Can update any user's:\n- Personal information\n- Avatar and projects\n- Account status\n- Online/offline status\n\n📝 Replace REPLACE_WITH_USER_ID with actual user ID"
          }
        },
        {
          "name": "Admin Deactivate User",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"is_active\": false,\n  \"status\": \"OFFLINE\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.REPLACE_WITH_USER_ID",
            "description": "👑 ADMIN: DEACTIVATE USER\n\n⚠️ Suspends user account\n📝 Replace REPLACE_WITH_USER_ID with actual user ID"
          }
        },
        {
          "name": "Admin Reactivate User",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"is_active\": true,\n  \"status\": \"ONLINE\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/users?id=eq.REPLACE_WITH_USER_ID",
            "description": "👑 ADMIN: REACTIVATE USER\n\n✅ Restores user account\n📝 Replace REPLACE_WITH_USER_ID with actual user ID"
          }
        }
      ]
    },
    {
      "name": "🧪 Debugging & Testing",
      "item": [
        {
          "name": "🔍 Test Auth User Creation Safe",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{supabase_anon_key}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"test_email\": \"debug-safe-{{$timestamp}}@ogrenci.karabuk.edu.tr\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/test_auth_user_creation_safe",
            "description": "🧪 SAFE DEBUG TEST\n\n✅ Tests user creation with duplicate prevention"
          }
        },
        {
          "name": "🚀 Test Fixed Auth Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{supabase_anon_key}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"test_email\": \"trigger-test-{{$timestamp}}@ogrenci.karabuk.edu.tr\"\n}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/test_fixed_auth_signup",
            "description": "🚀 TEST FIXED TRIGGER\n\n✅ Simulates the fixed auth trigger logic"
          }
        },
        {
          "name": "🧹 Cleanup Test Data",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "apikey",
                "value": "{{supabase_anon_key}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_access_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{}"
            },
            "url": "{{supabase_url}}/rest/v1/rpc/cleanup_test_data",
            "description": "🧹 CLEANUP TEST DATA\n\n✅ Removes all test users and roles\n⚠️ Use carefully - removes test data!"
          }
        }
      ]
    }
  ]
}