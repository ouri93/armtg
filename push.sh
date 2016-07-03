current_commit=$(git log | head --lines=1)
cp home_template.html home.html
sed -i "s/CURRENT_GIT_COMMIT/$current_commit/g" home.html
git add home.html
git commit -m "push.sh script changed git commit hash in home.html"
git push $1 $2
