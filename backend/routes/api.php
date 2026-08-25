<?php

use App\Http\Controllers\Api\V1\Admin\AdminNotificationController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\ContentAuditController as AdminContentAuditController;
use App\Http\Controllers\Api\V1\Admin\ContentController as AdminContentController;
use App\Http\Controllers\Api\V1\Admin\ContentRevisionController as AdminContentRevisionController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\EditorialActionController;
use App\Http\Controllers\Api\V1\Admin\RolePermissionController;
use App\Http\Controllers\Api\V1\Admin\TaxonomyController;
/** @noinspection PhpUndefinedClassInspection */
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->name('api.v1.admin.')->group(function (): void {
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::post('login', [AdminAuthController::class, 'login'])->name('login');

        Route::middleware(['auth:sanctum', 'admin.role'])->group(function (): void {
            Route::get('me', [AdminAuthController::class, 'me'])->name('me');
            Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');
        });
    });

    Route::middleware(['auth:sanctum', 'admin.role'])->group(function (): void {
        Route::get('dashboard', [AdminDashboardController::class, 'show'])->name('dashboard');
        Route::get('admin-users', [AdminUserController::class, 'index'])->name('admin-users.index');
        Route::post('admin-users', [AdminUserController::class, 'store'])->name('admin-users.store');
        Route::patch('admin-users/{adminUser}', [AdminUserController::class, 'update'])->name('admin-users.update');
        Route::get('roles', [RolePermissionController::class, 'roles'])->name('roles.index');
        Route::get('permissions', [RolePermissionController::class, 'permissions'])->name('permissions.index');
        Route::get('taxonomies', [TaxonomyController::class, 'index'])->name('taxonomies.index');
        Route::get('categories', [TaxonomyController::class, 'categories'])->name('categories.index');
        Route::post('categories', [TaxonomyController::class, 'storeCategory'])->name('categories.store');
        Route::patch('categories/{category}', [TaxonomyController::class, 'updateCategory'])->name('categories.update');
        Route::delete('categories/{category}', [TaxonomyController::class, 'destroyCategory'])->name('categories.destroy');
        Route::get('life-stages', [TaxonomyController::class, 'lifeStages'])->name('life-stages.index');
        Route::get('age-ranges', [TaxonomyController::class, 'ageRanges'])->name('age-ranges.index');
        Route::get('contents', [AdminContentController::class, 'index'])->name('contents.index');
        Route::post('contents', [AdminContentController::class, 'store'])->name('contents.store');
        Route::get('contents/{content}', [AdminContentController::class, 'show'])->name('contents.show');
        Route::patch('contents/{content}', [AdminContentController::class, 'update'])->name('contents.update');
        Route::post('contents/{content}/submit-review', [EditorialActionController::class, 'submitReview'])->name('contents.submit-review');
        Route::post('contents/{content}/request-adjustments', [EditorialActionController::class, 'requestAdjustments'])->name('contents.request-adjustments');
        Route::post('contents/{content}/approve', [EditorialActionController::class, 'approve'])->name('contents.approve');
        Route::post('contents/{content}/publish', [EditorialActionController::class, 'publish'])->middleware('admin.role:admin')->name('contents.publish');
        Route::post('contents/{content}/archive', [EditorialActionController::class, 'archive'])->middleware('admin.role:admin')->name('contents.archive');
        Route::get('contents/{content}/audit', [AdminContentAuditController::class, 'index'])->name('contents.audit');
        Route::get('contents/{content}/revisions', [AdminContentRevisionController::class, 'index'])->name('contents.revisions');
        Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('notifications.read');
    });
});
