#!/usr/bin/env bash

for filename in ../public/gallery/low/*/*.png; do
#    for ((i=0; i<=3; i++)); do
#        ./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
#    done
destFile=$(dirname "$filename")/$(basename "$filename" .png).webp
/Users/Misak/Tools/webp/libwebp-0.5.0-mac-10.9/bin/cwebp -q 80 "$filename" -o $destFile
#rm -f $filename
done

for filename in ../public/gallery/low/*/*.jpg; do
#    for ((i=0; i<=3; i++)); do
#        ./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
#    done
destFile=$(dirname "$filename")/$(basename "$filename" .jpg).webp
/Users/Misak/Tools/webp/libwebp-0.5.0-mac-10.9/bin/cwebp -q 80 "$filename" -o $destFile
#rm -f $filename
done