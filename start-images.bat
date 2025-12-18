xcopy src\playlist\* public\ /D
cd cmd
python get_image_dates.py
cd ..
:: pause
:: npm run start
:: xcopy public\*.json src\playlist\ /D