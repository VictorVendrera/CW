package com.nfcreader;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class DolValues {

    private List<DolTag> dolList = new ArrayList<>();
    private final Map<String, byte[]> dolTagMap;
    private final DolTag t9f66 = setTag(new byte[]{(byte) 0x9f, (byte) 0x66}, "Terminal Transaction Qualifiers", hexBlankToBytes("27 00 00 00"));
    private final DolTag t9f6600 = setTag(new byte[]{(byte) 0x9f, (byte) 0x66, (byte) 0x00}, "Terminal Transaction Qualifiers", hexBlankToBytes("27 00 00 00"));
    private final DolTag t9f6601 = setTag(new byte[]{(byte) 0x9f, (byte) 0x66, (byte) 0x01}, "Terminal Transaction Qualifiers", hexBlankToBytes("B7 60 40 00"));
    private final DolTag t9f6602 = setTag(new byte[]{(byte) 0x9f, (byte) 0x66, (byte) 0x02}, "Terminal Transaction Qualifiers", hexBlankToBytes("A0 00 00 00"));
    private final DolTag t9f6603 = setTag(new byte[]{(byte) 0x9f, (byte) 0x66, (byte) 0x03}, "Terminal Transaction Qualifiers", hexBlankToBytes("F0 20 40 00"));
    private final DolTag t9f02 = setTag(new byte[]{(byte) 0x9f, (byte) 0x02}, "Transaction Amount", hexBlankToBytes("00 00 00 00 10 00"));
    private final DolTag t9f03 = setTag(new byte[]{(byte) 0x9f, (byte) 0x03}, "Amount, Other (Numeric)", hexBlankToBytes("00 00 00 00 00 00"));
    private final DolTag t9f1a = setTag(new byte[]{(byte) 0x9f, (byte) 0x1a}, "Terminal Country Code", hexBlankToBytes("09 78"));
    private final DolTag t95 = setTag(new byte[]{(byte) 0x95}, "Terminal Verificat.Results", hexBlankToBytes("00 00 00 00 00"));
    private final DolTag t5f2a = setTag(new byte[]{(byte) 0x5f, (byte) 0x2a}, "Transaction Currency Code", hexBlankToBytes("09 78"));
    private final DolTag t9a = setTag(new byte[]{(byte) 0x9a}, "Transaction Date", hexBlankToBytes("23 03 01"));
    private final DolTag t9c = setTag(new byte[]{(byte) 0x9c}, "Transaction Type", hexBlankToBytes("00"));
    private final DolTag t9f37 = setTag(new byte[]{(byte) 0x9f, (byte) 0x37}, "Unpredictable Number", hexBlankToBytes("38 39 30 31"));
    private final DolTag t9f35 = setTag(new byte[]{(byte) 0x9f, (byte) 0x35}, "Terminal Type", hexBlankToBytes("22"));
    private final DolTag t9f45 = setTag(new byte[]{(byte) 0x9f, (byte) 0x45}, "Data Authentication Code", hexBlankToBytes("00 00"));
    private final DolTag t9f4c = setTag(new byte[]{(byte) 0x9f, (byte) 0x4c}, "ICC Dynamic Number", hexBlankToBytes("00 00 00 00 00 00 00 00"));
    private final DolTag t9f34 = setTag(new byte[]{(byte) 0x9f, (byte) 0x34}, "Terminal Transaction Qualifiers", hexBlankToBytes("00 00 00"));
    private final DolTag t9f21 = setTag(new byte[]{(byte) 0x9f, (byte) 0x21}, "Transaction Time (HHMMSS)", hexBlankToBytes("11 10 09"));
    private final DolTag t9f7c = setTag(new byte[]{(byte) 0x9f, (byte) 0x7c}, "Merchant Custom Data", hexBlankToBytes("00 00 00 00 00 00 00 00 00 00 00 00 00 00"));
    private final DolTag t00 = setTag(new byte[]{(byte) 0x00}, "Tag not found", hexBlankToBytes("00"));

    public DolValues() {
        dolTagMap = new HashMap<>();
        initDefaultValues();
    }

    private void initDefaultValues() {
        dolTagMap.put("9F66", new byte[]{(byte) 0x36, (byte) 0x00, (byte) 0x40, (byte) 0x00});
        dolTagMap.put("9F02", new byte[]{(byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00});
        dolTagMap.put("9F03", new byte[]{(byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00});
        dolTagMap.put("9F1A", new byte[]{(byte) 0x08, (byte) 0x26});
        dolTagMap.put("5F2A", new byte[]{(byte) 0x09, (byte) 0x86});
        dolTagMap.put("9F37", new byte[]{(byte) 0x11, (byte) 0x22, (byte) 0x33, (byte) 0x44});
        dolTagMap.put("9F35", new byte[]{(byte) 0x22});
        dolTagMap.put("9F45", new byte[]{(byte) 0x00, (byte) 0x00});
        dolTagMap.put("9F4C", new byte[]{(byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00});
        dolTagMap.put("9F34", new byte[]{(byte) 0x1E, (byte) 0x03, (byte) 0x80});
    }

    public String getDolName(byte[] tagByte) {
        for (int i = 0; i < dolList.size(); i++) {
            DolTag dolTag = dolList.get(i);
            if (Arrays.equals(dolTag.getTag(), tagByte)) {
                return dolTag.getTagName();
            }
        }
        return t00.getTagName();
    }

    public byte[] getDolValue(byte[] tagByte) {
        for (int i = 0; i < dolList.size(); i++) {
            DolTag dolTag = dolList.get(i);
            if (Arrays.equals(dolTag.getTag(), tagByte)) {
                return dolTag.getDefaultValue();
            }
        }
        return null;
    }

    public byte[] getDolValue(byte[] dolTag, byte[] alternativeTtq) {
        String dolTagAsString = bytesToHex(dolTag);
        
        if (dolTagAsString.equalsIgnoreCase("9F66") && alternativeTtq != null) {
            return alternativeTtq;
        }
        
        return dolTagMap.get(dolTagAsString);
    }

    public String dump() {
        StringBuilder sb = new StringBuilder();
        sb.append("TAG    DESCRIPTION                 VALUE\n");
        sb.append("----------------------------------------------\n");
        
        for (Map.Entry<String, byte[]> entry : dolTagMap.entrySet()) {
            String tag = entry.getKey();
            byte[] value = entry.getValue();
            
            String description = getTagDescription(tag);
            
            sb.append(tag).append("  ");
            sb.append(padRight(description, 25)).append(" ");
            sb.append(bytesToHex(value)).append("\n");
        }
        
        return sb.toString();
    }

    private String getTagDescription(String tag) {
        switch (tag) {
            case "9F66": return "Terminal Transaction Qual.";
            case "9F02": return "Amount, Authorized";
            case "9F03": return "Amount, Other";
            case "9F1A": return "Terminal Country Code";
            case "5F2A": return "Transaction Currency Code";
            case "9F37": return "Unpredictable Number";
            case "9F35": return "Terminal Type";
            case "9F45": return "Data Authentication Code";
            case "9F4C": return "ICC Dynamic Number";
            case "9F34": return "CVM Results";
            default: return "Unknown Tag";
        }
    }

    private String padRight(String s, int n) {
        if (s.length() >= n) {
            return s.substring(0, n);
        }
        return s + " ".repeat(n - s.length());
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02X", b));
        }
        return result.toString();
    }

    private DolTag setTag(byte[] tagByte, String tagName, byte[] tagValueByte) {
        DolTag dolTag = new DolTag(tagByte, tagName, tagValueByte);
        dolList.add(dolTag);
        return dolTag;
    }

    private static byte[] hexBlankToBytes(String str) {
        str = str.replaceAll(" ", "");
        byte[] bytes = new byte[str.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(str.substring(2 * i, 2 * i + 2), 16);
        }
        return bytes;
    }

    private String trimStringRight(String data, int len) {
        if (data.length() >= len) {
            data = data.substring(0, (len - 1));
        }
        while (data.length() < len) {
            data = data + " ";
        }
        return data;
    }

    private static String bytesToHexNpe(byte[] bytes) {
        if (bytes != null) {
            StringBuffer result = new StringBuffer();
            for (byte b : bytes)
                result.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
            return result.toString();
        } else {
            return "";
        }
    }
} 