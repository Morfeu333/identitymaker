@echo off
echo Adding remaining files...
git add .
echo.
echo Committing final files...
git commit -m "Add final batch files and complete documentation"
echo.
echo Final push to GitHub...
git push origin master
echo.
echo All files successfully pushed to GitHub!
echo Repository: https://github.com/Morfeu333/identitymaker.git
