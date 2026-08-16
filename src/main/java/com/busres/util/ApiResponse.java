package com.busres.util;

/** Uniform JSON envelope: { "success": true, "message": "...", "data": ... } */
public class ApiResponse {
    private boolean success;
    private String message;
    private Object data;

    public ApiResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    public static ApiResponse ok(Object data) { return new ApiResponse(true, "OK", data); }
    public static ApiResponse ok(String msg, Object data) { return new ApiResponse(true, msg, data); }
    public static ApiResponse fail(String msg) { return new ApiResponse(false, msg, null); }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Object getData() { return data; }
}
